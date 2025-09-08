import tensorflow as tf
from PIL import Image
import numpy as np
import io
import os
import json

class OtolithClassifier:
    _model = None
    _class_names = None

    def _load_model(self):
        print("--- LOADING TRAINED MODEL ---")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, 'otolith_classifier_model.h5')
        class_map_path = os.path.join(current_dir, 'class_indices.json')

        self._model = tf.keras.models.load_model(model_path)
        with open(class_map_path, 'r') as f:
            class_indices = json.load(f)
            self._class_names = {v: k for k, v in class_indices.items()}
        print("--- MODEL LOADED ---")

    def get_model_and_classes(self):
        if self._model is None:
            self._load_model()
        return self._model, self._class_names

    def predict(self, image_bytes: bytes, temperature: float = 0.43, logit_boost: float = 0.1) -> dict:
        """
        Predict the species with enhanced confidence using temperature scaling and optional logit boost.
        """
        model, class_names = self.get_model_and_classes()

        # --- Preprocess image ---
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))
        img_array = tf.keras.utils.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0

        # --- Model prediction ---
        logits = model.predict(img_array, verbose=0)[0]

        # --- Optional logit boost for top class ---
        logits += logit_boost

        # --- Temperature-scaled softmax ---
        scaled_logits = logits / temperature
        probabilities = tf.nn.softmax(scaled_logits).numpy()

        predicted_index = np.argmax(probabilities)
        confidence = 100 * probabilities[predicted_index]

        # --- Threshold logic ---
        CONFIDENCE_THRESHOLD_HIGH = 67.0
        CONFIDENCE_THRESHOLD_LOW = 50.0

        if confidence >= CONFIDENCE_THRESHOLD_HIGH:
            species = class_names[predicted_index].replace("_", " ")
        elif CONFIDENCE_THRESHOLD_LOW <= confidence < CONFIDENCE_THRESHOLD_HIGH:
            species = class_names[predicted_index].replace("_", " ") + " (Uncertain)"
        else:
            species = "Unknown Species"
        return {
            "predicted_species": species,
            "confidence_score": round(confidence, 2)
        }



# Global instance
otolith_classifier = OtolithClassifier()
