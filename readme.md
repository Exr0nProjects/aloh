# aloh

**A ~~second~~ brain, for you, forever.** 
Like [obsidian](https://obsidian.md) but better.

**The auto-suggest layer for human thinking** but Ideaflow doesn't autosuggest yet.

**"Minimize capture friction"** -Jacob Cole

**Proactive/searchable/ mind mapping at speed**

**Note connections, not concepts** (the core of associative notetaking as opposed to zettelkasten)

**Write flows, read refs** (the main source of friction in zettelkasten) (refs are concept-centric while flows are relation-centric)

**Hackable to the core** its literally a language server.

**Learning is about editing and iterating, not writing and copying.** 

**Passes the no-mouse test** which unfortunately many apps don't (obsidian, ideaflow atm).

## data model
- note / file / document
    - documents have IDs. it's the filename excluding the `.aloh` extention.
- entity
    - entities don't have IDs, because thats cringe. (makes it not look like real text)
    - data
        - name
        - akas 
        - shortest aka? or just calculate it?
        - dict<fileid, list[reference lines]>
- relation
    - relations also don't have IDs. you shouldn't be renaming these.
    - denoted `.relation` (allows alphanumeric + hyphens)
- tag ??
    - are tags just entities
    - denoted `:tag` (allows alphanumeric + hyphens)
DEPRECATED:
- database
    - list of associative notes + related links 
    - list of tags + relations 
    - relation tree?
    - type tree?
- state to maintain
    - entities
        - all .aka s
        - shortest .aka
        - relation instances that mention 
    - relations / tags
        - mentions 
    - relation instance
        - created
        - importance???? 
- how to find entities
    - strip whitespace -> keyword matching
    - anything thats capitalized
    - one-word capitalized strings that match entities found so far in a document (TODO)
        - longform must be >= 2 words
        - shortform must cover every capitalized letter
        - Quality of Life -> QoL, Vision Transformer -> ViT
    - anything in brackets
    - named entity recognition
    - TF-IDF? how to chunk into terms?

### a note on stats
- a line is considered to refer to all entities of the nearest de-indented above line with an entity/tag reference in it
    - for instance, this line has three associated lines: (two below plus the line itself)
        - this line has just two associated lines (itself and it's child)
            - this line is only associated with it's direct parent
        - this line is not associated with it's above sibling, but is associated with it's parent

## tinfoil hat
- ideal [ideaflow][ideaflow.io] but I can't wait for Jacob et al. to implement stuff
- see +associative notes language server in ideaflow
- in show-documentation for code completions, show recently queried/viewed/added links or links with related keywords in current document
- components
    - NER (spacy pipeline https://spacy.io/universe/project/spacy-js?)
    - keyword extraction: TF-IDF on SpaCy output?
    - some kind of database
- outside integration
    - google knowledge graph types
    - wikification

- cant fall asleep
    - warn if an entity appears only once and has an empty definitions file
    - syntax highlighting on entities, relations, tags
    - special relations
        - .aka
    - avoid colliding with org / md syntax to allow usage with both 
    - fixit mode:
        - ask about relations between entities that often appear near eachother
        - when something of a type doesn't have the same relations as other things of a type
        - should also train spacy to get better using entity linking and a KB: https://spacy.io/api/kb
    - language server
        - go to definition
        - find references
        - show documentation: show relevant relations
    - vim shortcut to expand definition 
        - C-smt -> <ESC>:vsp<C-w><C-h><C-o><C-w><C-l>
    - native subtype completion using paths
        - .eg
            - [Jacob Cole]
                - #profession/entrepreneur
                - #nationality/american
            - then, when writing you could do:
                - .eg American entrepreneur [complete Jacob Cole because keyword matching]
                + .eg Jacob Cole, an [complete american or entrepreneur bc keyword matching + understanding rules for 'an' or etc or even ML here]
    - ways of linking things together for context-aware re-ranking
        - the subtype completion keyword maching example
        - spatial closeness (how many times do they appear within the same sentence/note)
        - temporal closenesss (how often are the mentioned within a few minutes/hours/days of eachother)

- inspiration
    - Jacob Cole + Ideaflow: associative notes
    - Huxley Marvit: "I really like how it completes words, it makes it so much easier to type" in reference to ViM's default keyword completion in text documents

## links
- tutorial https://code.visualstudio.com/api/language-extensions/language-server-extension-guide
