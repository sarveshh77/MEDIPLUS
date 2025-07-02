import pickle
import sys

try:
    import sklearn
except ImportError:
    sklearn = None

def print_model_info(model):
    print("Model class:", type(model))
    if hasattr(model, '__module__'):
        print("Model module:", model.__module__)
        if 'sklearn' in model.__module__:
            if sklearn:
                print("scikit-learn version (current env):", sklearn.__version__)
            else:
                print("scikit-learn not installed in this environment.")
    if hasattr(model, 'get_params'):
        print("Model parameters:", model.get_params())
    if hasattr(model, 'feature_importances_'):
        print("Feature importances (first 10):", getattr(model, 'feature_importances_', None)[:10])
    print("Model __dict__ keys:", list(model.__dict__.keys()))

def main():
    pkl_path = "RandomForestPredictor.pkl"
    with open(pkl_path, "rb") as f:
        model = pickle.load(f)
    print_model_info(model)
    print("Python version used to load:", sys.version)

if __name__ == "__main__":
    main() 