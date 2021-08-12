## installing

```sh
python3 -m venv .venv 
source .venv/bin/activate
python3 -m pip install -r requirements.txt
python3 -m spacy download en_core_web_trf 
python3 -m spacy download en_core_web_lg
```

## things that are jank

- filetype: currently piggybacks on cucumber filetype 
- database
- always chooses the default workspace folder

