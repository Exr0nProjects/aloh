# server to run spacy pipeline

import spacy

def run_named_entity(nlp, text):
    ents = nlp(text).ents

    for ent in ents:
        print(ent.text, ent.label_)

if __name__ == '__main__':
    from sys import argv
    _, PORT, SPACY_MODEL = argv

    try:
        nlp = spacy.load(SPACY_MODEL)
    except OSError:
        from subprocess import run
        run(['python3', '-m', 'spacy', 'download', SPACY_MODEL])
        nlp = spacy.load(SPACY_MODEL)

    print('spacy loaded successfully')

    text = "aloh is an app inspired by jacob cole and huxley marvit"
    run_named_entity(nlp, text)

