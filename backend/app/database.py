# 1. Import the 'os' module to access environment variables.
import os
# 2. Import necessary components from SQLAlchemy.
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.orm import sessionmaker
# 3. Import the 'load_dotenv' function to load our .env file.
from dotenv import load_dotenv

# 4. Execute the function to find and load the variables from the .env file.
load_dotenv()

# 5. Read the database URL from the environment variable named "DATABASE_URL".
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 6. Create the SQLAlchemy engine, which is the core entry point to the database.
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 7. Create a SessionLocal class. Instances of this class will be our individual database sessions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 8. Create a Base class. Our ORM models in models.py will inherit from this class.
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()