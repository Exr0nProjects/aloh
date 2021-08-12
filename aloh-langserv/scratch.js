const spacyNLP = require("spacy-nlp");

const serverPromise = spacyNLP.server({ port: process.env.IOPORT });

const nlp = spacyNLP.nlp;

console.log('ready to go!')

const text = 'The United States increased diplomatic, military, and economic pressures on the Soviet Union, at a time when the communist state was already suffering from economic stagnation. On 12 June 1982, a million protesters gathered in Central Park, New York to call for an end to the Cold War arms race and nuclear weapons in particular. In the mid-1980s, the new Soviet leader Mikhail Gorbachev introduced the liberalizing reforms of perestroika ("reorganization", 1987) and glasnost ("openness", c. 1985) and ended Soviet involvement in Afghanistan.';

// Note you can pass multiple sentences concat in one string.
nlp.parse_named_entities(text).then(output => {
  console.log(output);
  //console.log(JSON.stringify(output[0].parse_tree, null, 2));
});

// Store output into variable
//nlp.parse("Bob Brought the pizza to Alice.");

