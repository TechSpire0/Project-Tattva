# backend/tests/test_api.py

from fastapi.testclient import TestClient
from app.main import app
import os
import pytest 
import mimetypes 
from app.core import llm_service

# 2. Create an instance of the TestClient.
client = TestClient(app)

# --- Test for the Species Endpoint (Existing) ---
def test_get_all_species():
    """
    Tests the GET /api/species endpoint.
    """
    # Make a GET request to the endpoint.
    response = client.get("/api/species")

    # Assert 1: Check for a successful status code.
    assert response.status_code == 200
    
    # Assert 2: Check that the response is a list.
    data = response.json()
    assert isinstance(data, list)
    
    # Assert 3: Check that we received the seeded data.
    assert len(data) > 0
    assert data[0]["common_name"] == "Indian Oil Sardine"


# --- NEW Test for the Sightings Endpoint ---
def test_get_all_sightings():
    """
    Tests the GET /api/sightings endpoint.
    """
    # 3. Make a GET request to the /api/sightings endpoint.
    response = client.get("/api/sightings")

    # 4. Assert 1: Check for a successful 200 OK status code.
    assert response.status_code == 200

    # 5. Assert 2: Check that the response body is a list.
    data = response.json()
    assert isinstance(data, list)
    
    # 6. Assert 3: Check that we received our 3 seeded sighting records.
    assert len(data) == 3

    # 7. Assert 4: This is the most important check. We verify the structure
    #    of the nested 'species' object within the first sighting.
    first_sighting = data[0]
    assert "sighting_id" in first_sighting
    assert "species" in first_sighting
    
    # 8. Assert 5: Check the structure of the nested species object itself.
    nested_species = first_sighting["species"]
    assert "scientific_name" in nested_species
    assert nested_species["id"] == 1


@pytest.mark.parametrize("test_image_name", ["test_image.jpg", "test_image.png"])
def test_classify_otolith_with_different_formats(test_image_name):
    """
    Tests the POST /api/classify_otolith endpoint with both JPG and PNG images.
    """
    # 2. Define the path to the current test image.
    test_image_path = os.path.join(os.path.dirname(__file__), test_image_name)
    
    # 3. This is the key fix: We use the `mimetypes` library to automatically
    #    and correctly guess the content type based on the file extension.
    content_type, _ = mimetypes.guess_type(test_image_path)
    if content_type is None:
        content_type = "application/octet-stream" # A default fallback

    # 4. Open the image file in binary read mode ('rb').
    with open(test_image_path, "rb") as image_file:
        # 5. Make the POST request using the dynamically determined content type.
        response = client.post(
            "/api/classify_otolith",
            files={"file": (test_image_name, image_file, content_type)}
        )

    # 6. The assertions remain the same, as they check the JSON response.
    assert response.status_code == 200
    data = response.json()
    assert "predicted_species" in data
    assert "confidence_score" in data
    known_species = ["Gadus morhua", "Sardinella longiceps"]
    assert data["predicted_species"] in known_species


def test_get_hypotheses(monkeypatch):
    """
    Tests the GET /api/hypotheses endpoint by mocking the external LLM call.
    """
    # 1. Define a simple, fake function that mimics our real LLM service.
    #    It takes the same arguments but returns a predictable string instantly.
    def mock_generate_hypothesis(finding: dict) -> str:
        return "This is a mock hypothesis based on the finding."

    # 2. This is the core of the mock. We use pytest's `monkeypatch` fixture.
    #    `setattr` replaces the real function with our mock function for the duration of this test.
    #    The target is specified as a string: 'module.path.function_name'.
    monkeypatch.setattr(llm_service, "generate_hypothesis_from_finding", mock_generate_hypothesis)

    # 3. Now, we make the API call. FastAPI will run our endpoint, but when it
    #    tries to call the llm_service, it will execute our mock function instead.
    response = client.get("/api/hypotheses")

    # 4. Assert that the endpoint itself worked correctly.
    assert response.status_code == 200

    # 5. Assert that the response contains our mock hypothesis text.
    #    This proves that our endpoint logic is working correctly, even though
    #    we never actually called the Google Gemini API.
    data = response.json()
    assert "hypothesis" in data
    assert data["hypothesis"] == "This is a mock hypothesis based on the finding."