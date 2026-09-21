// The course map. Each stage builds on the ones before it.
// `sources` names the university courses a stage draws its common ground from.
// A lesson with an `href` is written; one without is planned.
window.CURRICULUM = [
  {
    title: 'How computers work',
    summary: 'Bits, logic, the machine that runs your code, and your first programs.',
    sources: ['Harvard CS50', 'MIT 6.100L', 'CMU 15-213', 'Nand2Tetris'],
    lessons: [
      { id: 'bits', title: 'Bits, bytes, and how everything becomes a number', href: 'lessons/01-bits-and-bytes.html', minutes: 45 },
      { id: 'gates', title: 'From logic gates to a CPU' },
      { id: 'fetch', title: 'How a program actually runs' },
      { id: 'first-programs', title: 'Values, variables, and control flow' },
      { id: 'functions', title: 'Functions and abstraction' },
    ],
  },
  { title: 'Programming with abstraction', summary: 'Recursion, higher-order functions, objects, and the shape of good programs.', sources: ['Berkeley CS61A', 'Stanford CS106B', 'MIT 6.102'] },
  { title: 'Data structures and algorithms', summary: 'Arrays to graphs, sorting to shortest paths, and how to reason about cost with Big-O.', sources: ['MIT 6.006', 'Princeton COS 226', 'Stanford CS161'] },
  { title: 'Computer systems', summary: 'Memory, caches, assembly, linking, and why your code is fast or slow.', sources: ['CMU 15-213', 'Berkeley CS61C'] },
  { title: 'Operating systems and concurrency', summary: 'Processes, threads, scheduling, virtual memory, file systems, and locks.', sources: ['MIT 6.1810', 'Berkeley CS162', 'OSTEP'] },
  { title: 'Networks and the web', summary: 'From packets to TCP to HTTP, and how a browser turns a URL into a page.', sources: ['Stanford CS144', 'Berkeley CS168'] },
  { title: 'Databases', summary: 'The relational model, SQL, indexes, transactions, and how storage engines work.', sources: ['CMU 15-445', 'Berkeley CS186'] },
  { title: 'The engineer\'s toolkit', summary: 'The shell, Git, debugging, testing, and the habits that make code maintainable.', sources: ['MIT Missing Semester', 'CMU 17-313', 'Stanford CS190'] },
  { title: 'Software design and architecture', summary: 'Modules, interfaces, complexity, and designing systems other people can change.', sources: ['Stanford CS190', 'MIT 6.102', 'CMU 17-313'] },
  { title: 'Distributed systems and the cloud', summary: 'Replication, consensus, failure, and how large services stay up.', sources: ['MIT 6.5840', 'CMU 15-440'] },
  { title: 'Security', summary: 'Threat models, memory-safety bugs, web attacks, cryptography basics, and defense.', sources: ['MIT 6.5660', 'Stanford CS155', 'Berkeley CS161'] },
  { title: 'Math for machine learning', summary: 'Vectors, matrices, gradients, and probability: only what the models actually use.', sources: ['MIT 18.06', 'Stanford CS229 notes', 'Mathematics for ML (Deisenroth)'] },
  { title: 'Machine learning', summary: 'Learning from data: regression, classification, overfitting, and evaluation.', sources: ['Stanford CS229', 'MIT 6.3900'] },
  { title: 'Deep learning', summary: 'Neural networks, backpropagation, training, CNNs, and how to debug a model.', sources: ['Stanford CS231n', 'fast.ai', 'MIT 6.S191'] },
  { title: 'Language models', summary: 'Tokens, embeddings, attention, transformers, and how LLMs are trained and tuned.', sources: ['Stanford CS224N', 'Stanford CS336', 'Karpathy: Zero to Hero'] },
  { title: 'Building with AI', summary: 'Prompting, retrieval, tool use, agents, evaluation, and shipping AI features responsibly.', sources: ['Stanford CS329A', 'Berkeley CS294 (LLM agents)', 'Vendor docs'] },
  { title: 'Where AI is heading', summary: 'Scaling, reasoning models, agents at work, safety, and how to keep learning as it changes.', sources: ['Stanford CS324', 'Research papers', 'Lab reports'] },
];
