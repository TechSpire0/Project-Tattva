import tensorflow as tf
from PIL import Image
import numpy as np
import io
import os # <-- Make sure 'os' is imported

class OtolithClassifier:
    _model = None
    _class_names = None

    def _load_model(self):
        """
        Loads the trained TensorFlow model and class names using a robust path.
        """
        print("--- LOADING TRAINED MODEL (LOCAL) ---")
        
        # --- THIS IS THE DEFINITIVE FIX ---
        # 1. Get the directory where this current script (`classifier.py`) is located.
        #    os.path.abspath(__file__) gets the full path to this file.
        #    os.path.dirname(...) gets the directory part of that path.
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 2. Join that directory path with the model's filename to create a
        #    foolproof, absolute path to the model file.
        model_path = os.path.join(current_dir, 'otolith_classifier_model.h5')
        
        print(f"--- Attempting to load model from: {model_path} ---")
        self._model = tf.keras.models.load_model(model_path)
        
        # This must match the alphabetical order of the training data sub-folders.
        self._class_names = ['Gadus_morhua', 'Sardinella_longiceps']
        print("--- MODEL LOADED SUCCESSFULLY ---")

    # ... (the rest of the class: get_model_and_classes, predict, etc., remains exactly the same) ...
    def get_model_and_classes(self):
        if self._model is None:
            self._load_model()
        return self._model, self._class_names

    def predict(self, image_bytes: bytes) -> dict:
        model, class_names = self.get_model_and_classes()
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        img_array = tf.keras.utils.img_to_array(img)
        img_array = img_array / 255.0
        img_array = tf.expand_dims(img_array, 0)
        predictions = model.predict(img_array)
        score = tf.nn.softmax(predictions[0])
        predicted_class = class_names[np.argmax(score)]
        confidence_score = 100 * np.max(score)
        return {
            "predicted_species": predicted_class.replace("_", " "),
            "confidence_score": round(confidence_score, 2)
        }

# Create a single, global instance of the classifier.
otolith_classifier = OtolithClassifier()