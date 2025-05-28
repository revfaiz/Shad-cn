from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    model_path: str
    output_dir: str
    conf_thresh: float = 0.5

    class Config:
        env_file = ".env.example"

settings = Settings()