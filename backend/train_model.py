import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ReduceLROnPlateau, EarlyStopping
import os
import json

# --- Configuration ---
# --- THIS IS THE ONLY CHANGE YOU NEED TO MAKE ---
# We are now pointing the script to your new, curated "final" dataset folder.
DATASET_PATH = 'ml_model_data/otolith_dataset'
# --- END OF CHANGE ---

MODEL_SAVE_PATH = 'app/ml/otolith_classifier_model.h5'
CLASS_MAP_SAVE_PATH = 'app/ml/class_indices.json'

IMG_SIZE = (224, 224)
BATCH_SIZE = 8
INITIAL_EPOCHS = 20
FINETUNE_EPOCHS = 15
INITIAL_LEARNING_RATE = 0.001
FINETUNE_LEARNING_RATE = 1e-5 # A very low learning rate for deep fine-tuning

def train():
    print("--- Starting Professional Deep Fine-Tuning ---")

    # This ImageDataGenerator is already configured for robust augmentation.
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=0.25,
        rotation_range=45,
        width_shift_range=0.3,
        height_shift_range=0.3,
        shear_range=0.3,
        zoom_range=0.4,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    # The generators will automatically find the 5 species in the new path.
    train_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )
    validation_generator = train_datagen.flow_from_directory(
        DATASET_PATH,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )
    
    print(f"Found {len(train_generator.class_indices)} classes: {list(train_generator.class_indices.keys())}")

    # --- Transfer Learning Setup ---
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False

    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.5)(x)
    num_classes = len(train_generator.class_indices)
    predictions = Dense(num_classes, activation='softmax')(x)
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # === STAGE 1: INITIAL TRAINING ===
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=INITIAL_LEARNING_RATE), 
                  loss='categorical_crossentropy', 
                  metrics=['accuracy'])

    early_stopping = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)

    print("--- STAGE 1: Starting Initial Training ---")
    model.fit(train_generator, 
              epochs=INITIAL_EPOCHS, 
              validation_data=validation_generator, 
              callbacks=[early_stopping])

    # === STAGE 2: DEEP FINE-TUNING ===
    base_model.trainable = True
    fine_tune_at = 55 
    for layer in base_model.layers[:fine_tune_at]:
        layer.trainable = False
        
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=FINETUNE_LEARNING_RATE),
                  loss='categorical_crossentropy',
                  metrics=['accuracy'])

    print("--- STAGE 2: Starting Deep Fine-Tuning ---")
    total_epochs = INITIAL_EPOCHS + FINETUNE_EPOCHS
    model.fit(train_generator, 
              epochs=total_epochs, 
              initial_epoch=INITIAL_EPOCHS,
              validation_data=validation_generator,
              callbacks=[early_stopping])

    # --- SAVE FINAL MODEL ---
    print("--- Training Complete. Saving Final Model ---")
    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    model.save(MODEL_SAVE_PATH)
    class_indices = train_generator.class_indices
    with open(CLASS_MAP_SAVE_PATH, 'w') as f:
        json.dump(class_indices, f)
    print("--- Final Model and Class Map Saved ---")

if __name__ == "__main__":
    train()

