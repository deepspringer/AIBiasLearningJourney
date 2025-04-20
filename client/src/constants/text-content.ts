export const ALGORITHMIC_BIAS_TEXT = [
  '## How Large Language Models Work\n\nImagine your phone\'s autocomplete feature that suggests words as you type. **Large Language Models (LLMs)** like ChatGPT work similarly, but on a much larger scale. They predict what word should come next based on which words and ideas appeared together in all the text they\'ve read.\n\nFor example, if you write "I like to eat ice..." the AI might predict "cream" should follow. These predictions happen token by token (tokens are words or word parts like prefixes), with each possibility assigned a probability score. For example, "cream" might be 99% likely. But there is a 1% chance that the next word should be "cubes." While the AI usually selects the most likely token, it includes some randomness to avoid being too predictable.',

  "## Learning from Human Biases\n\nSince LLMs learn from human-written text from the internet and books, they can pick up the same biases that exist in our society. If certain groups of people are described in stereotypical ways in the training data, the AI might learn and repeat these patterns unless steps are taken to prevent this.",

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
];

export const OLD_ALGORITHMIC_BIAS_TEXT = [
  "Algorithmic bias refers to systematic and repeatable errors in a computer system that create unfair outcomes, such as privileging one arbitrary group of users over others. Bias can emerge from many factors, including but not limited to the design of the algorithm or the unintended or unanticipated use or decisions relating to the way data is coded, collected, selected, or used to train the algorithm.",
  'Machine learning algorithms learn to make decisions based on training data, which can include biased human decisions or reflect historical or social inequities, even if sensitive variables such as gender, race, or sexual orientation are removed. This is known as "bias in, bias out" - when algorithms are trained on data containing human biases, they can amplify those biases in their outputs.',
  "For example, an AI hiring tool trained on historical hiring data might learn to prefer male candidates for technical roles if that reflects past hiring patterns. Similarly, facial recognition systems may perform better on lighter-skinned faces if they were primarily trained on datasets with underrepresentation of darker-skinned individuals.",
  'Addressing algorithmic bias requires diverse datasets, regular auditing for fairness, transparent AI systems, and diverse teams developing these technologies. Some researchers advocate for "algorithmic fairness" - designing systems that produce fair and equitable outcomes across different demographic groups.',
  "As AI systems become more integrated into society, understanding and mitigating algorithmic bias is crucial. Researchers, companies, and policymakers are increasingly working on methods to detect and reduce bias in algorithms to ensure these technologies benefit everyone fairly.",
];
