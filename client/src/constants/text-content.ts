export const ALGORITHMIC_BIAS_TEXT = [
  '## How Large Language Models Work\n\nImagine your phone\'s autocomplete feature that suggests words as you type. **Large Language Models (LLMs)** like ChatGPT work similarly, but on a much larger scale. They predict what word should come next based on which words and ideas appeared together in all the text they\'ve read.\n\nFor example, if you write "I like to eat ice..." the AI might predict "cream" should follow. These predictions happen token by token (tokens are words or word parts like prefixes), with each possibility assigned a probability score. For example, "cream" might be 99% likely. But there is a 1% chance that the next word should be "cubes." While the AI usually selects the most likely token, it includes some randomness to avoid being too predictable.',

  "## Learning from Human Biases\n\nSince LLMs learn from human-written text from the internet and books, they can pick up the same biases that exist in our society. This isn't a new problem—computer programs have been used for years to make important decisions in hiring, policing, loan approvals, and other areas, often carrying forward biases from their training data. LLMs are a new and more powerful technology, but they face similar challenges. If certain groups of people are described in unfair or stereotypical ways in the training data, the AI might learn and repeat these patterns unless steps are taken to prevent this. Without careful design and monitoring, these systems might continue or even strengthen existing unfairness in ways that are harder to notice.",

  `## Real-World Research

Scientists have conducted experiments to study these biases. In one study called "**The Silicon Ceiling**," researchers created identical resumes but gave them different names suggesting different genders and racial backgrounds (like "Jermaine Jackson" versus "Matthew Owens").

When asked to score these resumes, the AI sometimes rated them differently based solely on the names. Even more surprisingly, when asked to create resumes for fictional people with different names, the AI made assumptions about their backgrounds—creating resumes with:
- Less work experience for women
- "Immigrant markers" for Asian and Hispanic names

All without being told anything about these fictional people!

### Names Used in the Study
**Black or African American women's names:**  
Keisha Towns  
Tyra Cooks  
Janae Washington  
Monique Rivers  

**Black or African American men's names:**  
Jermaine Jackson  
Denzel Gaines  
Darius Mosby  
Darnell Dawkins  

**Hispanic or Latina American women's names:**  
Maria Garcia  
Vanessa Rodriguez  
Laura Ramirez  
Gabriela Lopez  

**Hispanic or Latino American men's names:**  
Miguel Fernandez  
Christian Hernandez  
Joe Alvarez  
Rodrigo Romero  

**Asian American women's names:**  
Vivian Cheng  
Christina Wang  
Suni Tran  
Mei Lin  

**Asian American men's names:**  
George Yang  
Harry Wu  
Pheng Chan  
Kenji Yoshida  

**White American women's names:**  
Katie Burns  
Cara O'Connor  
Allison Baker  
Meredith Rogers  

**White American men's names:**  
Gregory Roberts  
Matthew Owens  
Paul Bennett  
Chad Nichols  `,

  '## Cultural Variations in Bias\n\nBias also varies across cultures. Another study called "**IndiBias**" found that AI systems developed in the United States might be trained to avoid biases common in American society but miss biases specific to other cultures.\n\nThey tested AI systems for biases related to Indian society, including categories like:\n\nGender  \nReligion (Muslim, Hindu)  \nCaste (Brahmin, Kshatriya, Vaishya, Shudra)  \n\nThis highlights how important it is for AI to understand diverse cultural contexts from around the world, not just perspectives common in the United States.',

  '## Working Toward Solutions\n\nResearchers are working on solutions to reduce bias in AI. These include:\n\n1. Using diverse training data that represents many perspectives\n2. Creating tests to check for biases before releasing AI systems\n3. Fine-tuning the AI with carefully selected examples to reduce biases\n4. Having people from diverse backgrounds review AI outputs\n5. Involving people from different countries in the AI development process\n\n> "Understanding bias in AI is important because these systems increasingly influence many areas of our lives—from healthcare decisions to college admissions."',
  "## Bias Tool\n\nIn a moment, you'll get to experiment with a tool that shows how AI might respond differently when talking about different groups of people. \n\nThe tool will take an incomplete sentence with an asterisk (*) as a placeholder. For example, it might start with a sentence like: 'Students who are * like to play'. It will also have a list of words to put in the space where the asterisk is. The groups might be 'Black, White, Asian, and Latino.'\n\nThe tool will show you how the AI would complete the sentence for each group:\n\nStudents who are Black like to play _________ \n\nStudents who are White like to play _________ \n\nStudents who are Asian like to play _________ \n\nStudents who are Latino like to play _________ \n\n\nWhat do you think the AI might say to complete each sentence?",
  "## Results\n\nHere are the results of the test:\n\nStudents who are Black like to play basketball\n\n  Students who are White like to play soccer\n\nStudents who are Asian like to play badminton\n\nStudents who are Latino like to play soccer\n\n\nThe LLM knows those aren't the only possible answers. It has probabilities for each answer. For 'Black,' for example, the odds of the word beginning with 'basket' are about 99.5%.\nbasket\t99.518\n\n  sports\t0.317\n\n  games\t0.117\n\n  soc\t0.033\n\n  outside\t0.010\n\n\n  For White students, the odds of 'soc' (soccer) are about 73%.\n\n  soc\t73.059\n\n  basket\t16.302\n\n  outside\t9.887\n\n  sports\t0.383\n\n  games\t0.181\n\n\n  For Asian students, 'bad' (badminton) is about 76% likely.\n\n  bad\t75.565\n\n  basket\t13.131\n\n  games\t7.964\n\n soc\t1.078\n\n  table\t0.839\n\n\n  For Latino students, 'soc' (soccer) is virtually certain at about 100%.\n\n  soc\t99.997\n\n  sports\t0.001\n\n  f\t0.001\n\n  basket\t0.000\n\n  football\t0.000\n\n  How do these results compare to your expectations?",
  '## Graph\n\nFinally, you\'ll see a graph of the results. Each group is color-coded: Asian in purple, White in green, Black in yellow, and Latino in orange. The graph shows the probabilities of different completions for each group. As you can see, certain words are more strongly associated with specific groups: "bad(minton)" with Asian students, "soc(cer)" with Latino and White students, and "basket(ball)" with Black students.\n\n![Token Probability Distribution Graph](/bias-graph.png)\n\nAccording to this graph, which groups might play soccer.',
];
