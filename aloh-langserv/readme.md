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
- ignores subfolders when calculating file_id
- how to deal with name conflicts (eg. Braid (protocol) vs Braid (game))
    - trellick from the Ideaflow slack uses wiki-style parens 
    + but you don't want to have those in ur writing everywhere
        - criteria:
            - deals with duplications (fundamental issue is that the same term can be context-shortened)
            - works directly in text
            - no delimiters
            - avoid an external database and state syncing

- it might help to lemma-ize everything
