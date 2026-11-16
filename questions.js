/* questions.js: Grade 8 Science, Unit 5 (Matter, S8P1) Milestones-style item bank.
   Items are plain objects. Edit here; the engine never needs to change.
   Item fields:
     id, wk (1-5), std ("S8P1.a"), dok (1-3), t (mc | ms | dd | dnd | mp), p (points 1 or 2)
     stem (HTML), fig (HTML, optional), why (HTML rationale), ext (true = goes a little past the GaDOE teacher notes)
     mc : o:[[text, misconceptionTag], ...], k:index
     ms : o:[...], k:[indexes], pick:number to select
     dd : cloze:"text with {0} {1}", blanks:[{o:[...], k:index}]
     dnd: cols:[left header, right header], rows:[labels], chips:[labels], k:[chip index per row], reuse:true|false
     mp : parts:[{q, o, k}, ...]   (each part is 1 point)
*/
var STANDARDS = {
  'S8P1.a': { short: 'Pure substances and mixtures', full: 'Develop and use a model to compare and contrast pure substances (elements and compounds) and mixtures.' },
  'S8P1.b': { short: 'Particle motion and thermal energy', full: 'Develop and use models to describe the movement of particles in solids, liquids, gases, and plasma states when thermal energy is added or removed.' },
  'S8P1.c': { short: 'Physical and chemical properties', full: 'Plan and carry out investigations to compare and contrast chemical and physical properties of matter.' },
  'S8P1.d': { short: 'Chemical or physical change', full: 'Construct an argument based on observational evidence to support the claim that a change in a substance is either chemical or physical.' },
  'S8P1.e': { short: 'Atoms and the periodic table', full: 'Develop models by analyzing patterns within the periodic table that illustrate the structure, composition, and characteristics of atoms and simple molecules.' },
  'S8P1.f': { short: 'Conservation of matter', full: 'Construct an explanation based on evidence to describe conservation of matter in a chemical reaction.' }
};
var WEEKS = {
  1: { title: 'Week 1: Classifying Matter', sc: 'SC1', std: ['S8P1.a'] },
  2: { title: 'Week 2: States of Matter and Particle Motion', sc: 'SC2', std: ['S8P1.b'] },
  3: { title: 'Week 3: Physical and Chemical Properties and Changes', sc: 'SC3 (Week 3 focus)', std: ['S8P1.c', 'S8P1.d', 'S8P1.f'] },
  4: { title: 'Week 4: Reactants, Products, and Chemical Equations', sc: 'SC3 (Week 4 focus)', std: ['S8P1.f', 'S8P1.e'] },
  5: { title: 'Week 5: Cumulative Review and Unit Test', sc: 'SC1 to SC3', std: ['S8P1.a', 'S8P1.b', 'S8P1.c', 'S8P1.d', 'S8P1.f'] }
};
/* Misconception tags. "fix" is the one-line reteach move shown on the teacher report. */
var MISC = {
  M_ELCOMP:   { name: 'Treats elements and compounds as the same thing', fix: 'Sort particle models: one kind of atom (element) vs two or more kinds joined in a fixed ratio (compound).' },
  M_COMPMIX:  { name: 'Treats compounds and mixtures as the same thing', fix: 'Contrast joined atoms in a fixed ratio (compound) with separate substances that keep their properties (mixture).' },
  M_JOIN:     { name: 'Thinks joined atoms always make a compound', fix: 'Show O2 or N2: atoms are joined, but only one kind of atom, so it is an element.' },
  M_UNIFORM:  { name: 'Thinks "looks the same throughout" means pure substance', fix: 'Use salt water: uniform, but the composition can vary, so it is a homogeneous mixture.' },
  M_HETERO:   { name: 'Mixes up homogeneous and heterogeneous', fix: 'Homogeneous = uniform throughout. Heterogeneous = parts you can tell apart. Use trail mix vs sugar water.' },
  M_READ:     { name: 'Misread the model, key, or data', fix: 'Model the habit: read the key first, count each kind of particle, then decide.' },
  M_SIZE:     { name: 'Thinks particles grow, shrink, or melt when energy changes', fix: 'Particles keep their size and type. Only their motion and spacing change.' },
  M_STILL:    { name: 'Thinks particles in a solid (or cold matter) do not move', fix: 'Solid particles vibrate in place. Even cold matter has particle motion.' },
  M_DIRECTION:{ name: 'Mixes up adding and removing thermal energy', fix: 'Add energy: faster particles. Remove energy: slower particles. Cold is less energy, not something added.' },
  M_STATES:   { name: 'Mixes up spacing and motion across solid, liquid, and gas', fix: 'Compare three models side by side: spacing, movement, and whether particles can slide past each other.' },
  M_PLASMA:   { name: 'Thinks plasma is just a hot gas with no charge', fix: 'Plasma particles gain so much energy that electrons break free, leaving charged particles.' },
  M_PHYS2CHEM:{ name: 'Thinks a change of state makes a new substance', fix: 'Melting, freezing, boiling: same particles, new arrangement. Water stays water.' },
  M_AMOUNT:   { name: 'Thinks properties such as density change with sample size', fix: 'Do the 10 g vs 50 g sample comparison: density and melting point stay the same.' },
  M_ONEPROP:  { name: 'Used one property when more than one is needed to identify a substance', fix: 'Have students narrow the list with the first property, then use the second to decide.' },
  M_LOOKS:    { name: 'Thinks any visible change (color, shape, state) means a new substance formed', fix: 'Sort changes by evidence: gas, precipitate, unexpected temperature change, new odor, new color from a reaction.' },
  M_MIXCHEM:  { name: 'Thinks mixing or dissolving is a chemical change', fix: 'Can the parts be separated and do they keep their properties? Then it is physical.' },
  M_PROP:     { name: 'Mixes up physical and chemical properties', fix: 'Physical: observed without changing the substance. Chemical: observed only when it reacts or burns.' },
  M_LOSS:     { name: 'Thinks mass or matter is lost or destroyed in a reaction', fix: 'Track every atom. If mass seems lost, ask where a gas could have gone.' },
  M_NEWMATTER:{ name: 'Thinks reactions create new matter', fix: 'Atoms are rearranged, not made. Count atoms before and after.' },
  M_COEFF:    { name: 'Ignores the coefficient when counting atoms', fix: 'Coefficient multiplies the whole formula; subscript only counts atoms inside one molecule.' },
  M_REVERSE:  { name: 'Mixes up reactants and products', fix: 'Reactants are on the left (start). Products are on the right (made).' },
  M_MOLECOUNT:{ name: 'Thinks the number of molecules must stay the same', fix: 'Atoms are conserved, not molecules. 2H2 + O2 makes 2H2O: 3 molecules become 2.' },
  M_NUMBERS:  { name: 'Mixes up atomic number, atomic mass, and neutrons', fix: 'Atomic number = protons. Mass rounded minus atomic number = neutrons.' },
  M_NUCLEUS:  { name: 'Mixes up where the atom parts are', fix: 'Protons and neutrons are in the nucleus. Electrons are in the cloud around it.' },
  M_ROW:      { name: 'Uses the row instead of the column to find similar elements', fix: 'Columns (groups) share chemical properties. Rows (periods) do not.' },
  M_OVER:     { name: 'Overstates what the data shows', fix: 'Have students underline the exact pattern the data supports, then rewrite the conclusion.' },
  M_DESIGN:   { name: 'Chose an investigation or variable that does not answer the question', fix: 'Start from the question: what must change, what must stay the same, what will be observed?' }
};
var Q = [];
/* ---------------- WEEK 1: Classifying Matter (S8P1.a) ---------------- */
(function () {
  var one = function (svg, leg) { return '<div class="figone">' + svg + (leg || '') + '</div>'; };
  var Hl = [['H'], ['O']], NOl = [['N'], ['O']];

  Q.push({ id: 'W1-01', wk: 1, std: 'S8P1.a', dok: 1, t: 'mc', p: 1,
    stem: 'Which statement describes a pure substance?',
    o: [['It has a fixed composition that is the same in every sample.', null],
        ['It is made of two or more substances that each keep their own properties.', 'M_COMPMIX'],
        ['It can always be separated into its parts by filtering.', 'M_COMPMIX'],
        ['It is always made of only one kind of atom.', 'M_ELCOMP']],
    k: 0,
    why: 'A pure substance (an element or a compound) has a fixed composition that does not change from sample to sample. Choice A describes a mixture. Choice D describes only an element; a compound is also a pure substance and has more than one kind of atom. Filtering separates mixtures, not pure substances.' });

  Q.push({ id: 'W1-02', wk: 1, std: 'S8P1.a', dok: 1, t: 'mc', p: 1,
    stem: 'Which of these is an element?',
    o: [['Water', 'M_ELCOMP'], ['Carbon dioxide', 'M_ELCOMP'], ['Salt water', 'M_COMPMIX'], ['Gold', null]],
    k: 3,
    why: 'Gold is made of only one kind of atom, so it is an element. Water and carbon dioxide are compounds (two kinds of atoms joined in a fixed ratio). Salt water is a mixture.' });

  Q.push({ id: 'W1-03', wk: 1, std: 'S8P1.a', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a sample of matter. Each ball is an atom. Which classification best describes the sample?',
    fig: one(FIG.molBox([['H2O', 7]], { seed: 21 }), FIG.legend(Hl)),
    o: [['A compound', null], ['An element', 'M_ELCOMP'], ['A homogeneous mixture', 'M_UNIFORM'], ['A heterogeneous mixture', 'M_COMPMIX']],
    k: 0,
    why: 'Every particle is the same: two hydrogen atoms joined to one oxygen atom. One kind of particle with two kinds of atoms joined in a fixed ratio is a compound. It is not an element (two kinds of atoms) and not a mixture (only one kind of particle).' });

  Q.push({ id: 'W1-04', wk: 1, std: 'S8P1.a', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a sample of oxygen gas. Each ball is an atom. Which classification best describes the sample?',
    fig: one(FIG.molBox([['O2', 10]], { seed: 22 }), FIG.legend([['O']])),
    o: [['A compound', 'M_JOIN'], ['A heterogeneous mixture', 'M_HETERO'], ['An element', null], ['A homogeneous mixture', 'M_UNIFORM']],
    k: 2,
    why: 'Each particle is two oxygen atoms joined. Only one kind of atom is present, so the sample is an element. Atoms that are joined do not automatically make a compound. A compound needs two or more different kinds of atoms.' });

  Q.push({ id: 'W1-05', wk: 1, std: 'S8P1.a', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a sample of gas. Each ball is a single atom. Which statement is correct?',
    fig: one(FIG.molBox([['He', 8], ['Ne', 8]], { seed: 23 }), FIG.legend([['He'], ['Ne']])),
    o: [['It is a compound, because it contains two kinds of atoms.', 'M_COMPMIX'],
        ['It is an element, because every particle is a single atom.', 'M_ELCOMP'],
        ['It is a pure substance, because the atoms are spread out evenly.', 'M_UNIFORM'],
        ['It is a mixture of two elements.', null]],
    k: 3,
    why: 'Helium atoms and neon atoms are present and are not joined to each other. Each keeps its own properties, so this is a mixture of two elements. Being evenly spread out does not make something a pure substance.' });

  Q.push({ id: 'W1-06', wk: 1, std: 'S8P1.a', dok: 2, t: 'ms', p: 1, pick: 2,
    stem: 'Which TWO samples are pure substances?',
    o: [['Distilled water', null], ['Salt water', 'M_COMPMIX'], ['Pure aluminum', null], ['Air in a bicycle tire', 'M_COMPMIX'], ['Trail mix', 'M_HETERO']],
    k: [0, 2],
    why: 'Distilled water is a compound and pure aluminum is an element, so both are pure substances. Salt water, air, and trail mix each contain more than one substance, so they are mixtures.' });

  Q.push({ id: 'W1-07', wk: 1, std: 'S8P1.a', dok: 2, t: 'mc', p: 1,
    stem: 'A student stirs sugar into water until no sugar crystals can be seen. How should the result be classified?',
    o: [['A compound, because the sugar and water joined chemically', 'M_COMPMIX'],
        ['A heterogeneous mixture, because it contains more than one substance', 'M_HETERO'],
        ['A pure substance, because it looks the same throughout', 'M_UNIFORM'],
        ['A homogeneous mixture, because the sugar and water are evenly mixed and each keeps its own properties', null]],
    k: 3,
    why: 'Sugar water is the same throughout, so it is homogeneous, and the sugar and water are only mixed, not joined. Looking the same throughout does not make something a pure substance. Heterogeneous means the parts are not uniform.' });

  Q.push({ id: 'W1-08', wk: 1, std: 'S8P1.a', dok: 2, t: 'dd', p: 2,
    stem: 'A student looks at a bottle of Italian salad dressing. The oil, vinegar, and herbs can be seen as separate parts.',
    cloze: 'The dressing is classified as a {0}. This is correct because the parts of the dressing are {1}, and each ingredient {2}.',
    blanks: [{ o: ['pure substance', 'homogeneous mixture', 'heterogeneous mixture'], k: 2 },
             { o: ['the same in every part of the sample', 'different in different parts of the sample', 'joined in a fixed ratio'], k: 1 },
             { o: ['keeps its own properties', 'becomes a new substance', 'loses its properties'], k: 0 }],
    why: 'The parts can be seen and are not the same everywhere, so the dressing is a heterogeneous mixture. The ingredients were only mixed together, so each one keeps its own properties.' });

  Q.push({ id: 'W1-09', wk: 1, std: 'S8P1.a', dok: 2, t: 'dnd', p: 1,
    stem: 'Move the labels into the table to classify each sample of matter.',
    cols: ['Sample', 'Classification'],
    rows: ['Pure helium gas', 'Distilled water', 'Brass (copper and zinc metals evenly mixed)'],
    chips: ['element', 'compound', 'homogeneous mixture', 'heterogeneous mixture'],
    k: [0, 1, 2], reuse: false,
    why: 'Helium is one kind of atom (element). Water is two kinds of atoms joined in a fixed ratio (compound). Brass is two metals evenly mixed throughout (homogeneous mixture).' });

  Q.push({ id: 'W1-10', wk: 1, std: 'S8P1.a', dok: 3, t: 'mc', p: 1,
    stem: 'A student collected data on two materials. Each material was tested in two samples taken from different places. Which conclusion is best supported by the data?',
    fig: FIG.table(['Material', 'Sample', 'Composition'], [
      ['X', 'Sample 1 (Georgia)', '11.2% hydrogen and 88.8% oxygen by mass'],
      ['X', 'Sample 2 (Alaska)', '11.2% hydrogen and 88.8% oxygen by mass'],
      ['Y', 'Sample 1 (Georgia)', '3.1 g of salt in every 100 g of material'],
      ['Y', 'Sample 2 (Alaska)', '3.7 g of salt in every 100 g of material']], { cap: 'Composition of Materials X and Y' }),
    o: [['Both materials are pure substances because each is made of the same elements in every sample.', 'M_READ'],
        ['Material X is a mixture and Material Y is a pure substance because their compositions are different.', 'M_READ'],
        ['Both materials are mixtures because each contains more than one kind of atom.', 'M_COMPMIX'],
        ['Material X is a pure substance because its composition is the same in both samples, and Material Y is a mixture because its composition varies.', null]],
    k: 3,
    why: 'A pure substance has the same composition in every sample (Material X). The amount of salt in Material Y changes from sample to sample, so it is a mixture. Containing more than one kind of atom does not make something a mixture, because compounds do too.' });

  Q.push({ id: 'W1-11', wk: 1, std: 'S8P1.a', dok: 2, t: 'mc', p: 1, fixed: true,
    stem: 'Models A, B, C, and D show four samples of matter. Each ball is an atom. Which model represents a mixture of an element and a compound?',
    fig: FIG.panels([
      { svg: FIG.molBox([['Ne', 10]], { w: 180, h: 130, seed: 31 }), cap: 'Model A' },
      { svg: FIG.molBox([['CO2', 4]], { w: 180, h: 130, seed: 32 }), cap: 'Model B' },
      { svg: FIG.molBox([['He', 5], ['CO2', 3]], { w: 180, h: 130, seed: 33 }), cap: 'Model C' },
      { svg: FIG.molBox([['CO2', 3], ['H2O', 3]], { w: 180, h: 130, seed: 34 }), cap: 'Model D' }]) +
      FIG.legend([['C'], ['O'], ['H'], ['He'], ['Ne']]),
    o: [['Model A', 'M_READ'], ['Model B', 'M_READ'], ['Model C', null], ['Model D', 'M_ELCOMP']],
    k: 2,
    why: 'Model C has separate helium atoms (an element) mixed with carbon dioxide molecules (a compound). Model A is only an element. Model B is only a compound. Model D mixes two compounds.' });

  Q.push({ id: 'W1-12', wk: 1, std: 'S8P1.a', dok: 3, t: 'mp', p: 2,
    stem: 'The model shows a sample of gas. Each ball is an atom.',
    fig: one(FIG.molBox([['N2', 6], ['O2', 6]], { seed: 41 }), FIG.legend(NOl)),
    parts: [
      { q: 'Part A: Which statement correctly classifies the sample?',
        o: [['A pure substance with a fixed composition', 'M_UNIFORM'], ['A compound made of nitrogen and oxygen', 'M_COMPMIX'], ['An element made of nitrogen and oxygen', 'M_ELCOMP'], ['A mixture of two elements', null]], k: 3 },
      { q: 'Part B: Which observation about the model best supports the answer to Part A?',
        o: [['Nitrogen atoms and oxygen atoms are joined to each other in every particle.', 'M_COMPMIX'],
            ['There are two kinds of particles, and each kind is made of only one kind of atom.', null],
            ['All of the particles are the same size.', 'M_READ'],
            ['The particles are spread out evenly.', 'M_UNIFORM']], k: 1 }],
    why: 'Part A: Nitrogen particles and oxygen particles are both present and not joined to each other, so it is a mixture. Each kind is made of one kind of atom, so both are elements. Part B: Two kinds of particles, each made of one kind of atom, is the evidence. Even spacing only tells you the mixture is uniform.' });

  Q.push({ id: 'W1-13', wk: 1, std: 'S8P1.a', dok: 3, t: 'mc', p: 1,
    stem: 'Pure gold is soft, so jewelers mix gold with other metals. The table shows the makeup of two samples of 14-karat gold made by different jewelers. A student claims that 14-karat gold is a compound. Which statement from the data best argues against the claim?',
    fig: FIG.table(['Sample', 'Gold', 'Copper', 'Silver'], [['Jeweler A', '58.3%', '30.0%', '11.7%'], ['Jeweler B', '58.3%', '38.0%', '3.7%']], { cap: 'Makeup of two 14-karat gold samples' }),
    o: [['Both samples contain more than one kind of atom.', 'M_COMPMIX'],
        ['The amounts of copper and silver are different in the two samples, so the composition is not fixed.', null],
        ['Both samples contain the same percent of gold.', 'M_READ'],
        ['Both samples contain metals, and compounds cannot contain metals.', 'M_READ']],
    k: 1,
    why: 'A compound has a fixed composition. These two samples have different amounts of copper and silver, so 14-karat gold is a mixture. Compounds can also contain more than one kind of atom, so choice A does not argue against the claim.' });

  Q.push({ id: 'W1-14', wk: 1, std: 'S8P1.a', dok: 1, t: 'mc', p: 1,
    stem: 'Which of these is a heterogeneous mixture?',
    o: [['Soil', null], ['Steel', 'M_HETERO'], ['Air', 'M_HETERO'], ['Salt water', 'M_HETERO']],
    k: 0,
    why: 'Soil has parts that look different from place to place (rock bits, plant material), so it is heterogeneous. Steel, air, and salt water are each the same throughout, so they are homogeneous mixtures.' });

  Q.push({ id: 'W1-15', wk: 1, std: 'S8P1.a', dok: 3, t: 'dnd', p: 2,
    stem: 'Models 1, 2, 3, and 4 show four samples of matter. Each ball is an atom. Move the labels into the table to classify the matter in each model.',
    fig: FIG.panels([
      { svg: FIG.molBox([['H2O', 5]], { w: 180, h: 130, seed: 51 }), cap: 'Model 1' },
      { svg: FIG.molBox([['He', 5], ['Ne', 5]], { w: 180, h: 130, seed: 52, layout: 'cluster' }), cap: 'Model 2' },
      { svg: FIG.molBox([['Ne', 8]], { w: 180, h: 130, seed: 53 }), cap: 'Model 3' },
      { svg: FIG.molBox([['He', 5], ['Ne', 5]], { w: 180, h: 130, seed: 54 }), cap: 'Model 4' }]) +
      FIG.legend([['H'], ['O'], ['He'], ['Ne']]),
    cols: ['Model', 'Classification'],
    rows: ['Model 1', 'Model 2', 'Model 3', 'Model 4'],
    chips: ['element', 'compound', 'homogeneous mixture', 'heterogeneous mixture'],
    k: [1, 3, 0, 2], reuse: false,
    why: 'Model 1: one kind of particle with two kinds of atoms joined (compound). Model 2: two kinds of atoms sorted into separate regions, so the sample is not uniform (heterogeneous mixture). Model 3: one kind of atom (element). Model 4: two kinds of atoms spread evenly (homogeneous mixture).' });
})();
/* ---------------- WEEK 2: States of Matter and Particle Motion (S8P1.b) ---------------- */
(function () {
  var one = function (svg, leg) { return '<div class="figone">' + svg + (leg || '') + '</div>'; };
  var arrowBetween = '<div class="figarrow" aria-hidden="true">→</div>';

  Q.push({ id: 'W2-01', wk: 2, std: 'S8P1.b', dok: 1, t: 'mc', p: 1,
    stem: 'Which statement describes the particles in a solid?',
    o: [['They are far apart and move freely in all directions.', 'M_STATES'],
        ['They are close together and slide past one another.', 'M_STATES'],
        ['They are close together and vibrate in fixed positions.', null],
        ['They do not move at all.', 'M_STILL']],
    k: 2,
    why: 'Particles in a solid are packed closely and held in place, but they still vibrate. Sliding past each other describes a liquid. Being far apart and moving freely describes a gas.' });

  Q.push({ id: 'W2-02', wk: 2, std: 'S8P1.b', dok: 1, t: 'mc', p: 1,
    stem: 'Which state of matter is made of electrically charged particles?',
    o: [['Plasma', null], ['Gas', 'M_PLASMA'], ['Liquid', 'M_STATES'], ['Solid', 'M_STATES']],
    k: 0,
    why: 'In plasma, particles have so much energy that electrons break away from atoms, leaving charged particles. A gas is not charged.' });

  Q.push({ id: 'W2-03', wk: 2, std: 'S8P1.b', dok: 2, t: 'mc', p: 1, fixed: true,
    stem: 'Models A, B, C, and D show the particles of one substance in four different states. Which model represents the liquid state?',
    fig: FIG.panels([
      { svg: FIG.stateBox('solid', { seed: 3 }), cap: 'Model A' },
      { svg: FIG.stateBox('plasma', { seed: 4, n: 7 }), cap: 'Model B' },
      { svg: FIG.stateBox('gas', { seed: 5, n: 12 }), cap: 'Model C' },
      { svg: FIG.stateBox('liquid', { seed: 6 }), cap: 'Model D' }]) +
      FIG.legend(['Large circle: particle', '+ : positively charged particle', 'Small black dot: free electron']),
    o: [['Model A', 'M_STATES'], ['Model B', 'M_PLASMA'], ['Model C', 'M_STATES'], ['Model D', null]],
    k: 3,
    why: 'In a liquid the particles are close together but not in a fixed pattern, so they can slide past one another (Model D). Model A is a solid, Model B is a plasma (charged particles and free electrons), and Model C is a gas.' });

  Q.push({ id: 'W2-04', wk: 2, std: 'S8P1.b', dok: 2, t: 'mc', p: 1,
    stem: 'A sealed container holds a gas. The gas is cooled. What happens to the particles of the gas?',
    o: [['They move more slowly because thermal energy transferred out of the gas.', null],
        ['They move faster because cold is added to the gas.', 'M_DIRECTION'],
        ['They get smaller because the gas is colder.', 'M_SIZE'],
        ['They stop moving because the gas is cold.', 'M_STILL']],
    k: 0,
    why: 'Cooling means thermal energy leaves the gas, so the particles slow down. The particles do not change size and do not stop moving. Cold is not something that is added.' });

  Q.push({ id: 'W2-05', wk: 2, std: 'S8P1.b', dok: 2, t: 'dd', p: 1,
    stem: 'A student heats a block of ice.',
    cloze: 'When thermal energy is added to the ice, its particles move {0}. The particles themselves {1}.',
    blanks: [{ o: ['slower', 'at the same speed', 'faster'], k: 2 },
             { o: ['get larger', 'stay the same size', 'change into different particles'], k: 1 }],
    why: 'Added thermal energy makes particles move faster. The particles keep their size and type; only their motion and spacing change.' });

  Q.push({ id: 'W2-06', wk: 2, std: 'S8P1.b', dok: 2, t: 'mc', p: 1, fixed: true,
    stem: 'The models show the same gas in two identical sealed containers. The arrows show how fast the particles move. A longer arrow means a faster particle. Which statement correctly compares the gas in the two models?',
    fig: FIG.panels([
      { svg: FIG.stateBox('gas', { seed: 8, n: 9, arrows: 'long' }), cap: 'Model X' },
      { svg: FIG.stateBox('gas', { seed: 9, n: 9, arrows: 'short' }), cap: 'Model Y' }]),
    o: [['The gas in Model X has a lower temperature because its particles move farther.', 'M_DIRECTION'],
        ['The gas in both models has the same temperature because the particles are the same size.', 'M_SIZE'],
        ['The gas in Model Y has a higher temperature because its particles are closer together.', 'M_READ'],
        ['The gas in Model X has a higher temperature because its particles have more energy of motion.', null]],
    k: 3,
    why: 'Temperature tells how much energy of motion the particles have, on average. The particles in Model X move faster, so that gas has a higher temperature. The particle size is the same in both models.' });

  Q.push({ id: 'W2-07', wk: 2, std: 'S8P1.b', dok: 2, t: 'ms', p: 1, pick: 2,
    stem: 'As liquid water boils and changes to a gas, which TWO changes happen to the water particles?',
    o: [['The particles move faster.', null], ['The particles become hydrogen and oxygen atoms.', 'M_PHYS2CHEM'], ['The particles get larger.', 'M_SIZE'],
        ['The particles move farther apart.', null], ['The particles stop moving.', 'M_STILL']],
    k: [0, 3],
    why: 'Boiling adds thermal energy. The particles speed up and spread out. They are still water particles and they keep their size.' });

  Q.push({ id: 'W2-08', wk: 2, std: 'S8P1.b', dok: 1, t: 'dnd', p: 2,
    stem: 'Move the labels into the table to match each description of particles with the correct state of matter.',
    cols: ['Description of particles', 'State of matter'],
    rows: ['Particles are close together and slide past one another',
           'Particles are far apart, move extremely fast, and are electrically charged',
           'Particles vibrate in fixed positions',
           'Particles are far apart and move freely and randomly'],
    chips: ['solid', 'plasma', 'gas', 'liquid'],
    k: [3, 1, 0, 2], reuse: false,
    why: 'Liquid: close and sliding. Plasma: very fast, far apart, charged. Solid: vibrating in fixed positions. Gas: far apart and moving freely.' });

  Q.push({ id: 'W2-09', wk: 2, std: 'S8P1.b', dok: 2, t: 'mc', p: 1,
    stem: 'The models show the particles of a substance before and after it was placed on a hot plate. Which statement best describes what happened?',
    fig: FIG.panels([
      { svg: FIG.stateBox('solid', { seed: 12 }), cap: 'Before' },
      { svg: FIG.stateBox('liquid', { seed: 13 }), cap: 'After' }], { cls: 'with-arrow' }),
    o: [['Thermal energy was added, so the particles moved faster and could slide past one another.', null],
        ['Thermal energy was removed, so the particles slowed down and moved closer together.', 'M_DIRECTION'],
        ['The particles became smaller, so they could slide past one another.', 'M_SIZE'],
        ['The substance changed into a different substance made of different particles.', 'M_PHYS2CHEM']],
    k: 0,
    why: 'The hot plate adds thermal energy. The particles gain energy and move enough to slide past each other, which is a solid becoming a liquid. The particles stay the same size and kind.' });

  Q.push({ id: 'W2-10', wk: 2, std: 'S8P1.b', dok: 3, t: 'mc', p: 1,
    stem: 'On a cold morning, a driver finds that the air pressure in a car tire is lower than it was the afternoon before. No air leaked out of the tire. Which explanation uses a particle model to explain the lower pressure?',
    o: [['The air particles shrank in the cold, so they take up less space.', 'M_SIZE'],
        ['The cold added energy to the air, so the particles moved faster and escaped.', 'M_DIRECTION'],
        ['Thermal energy transferred out of the air, so the particles move more slowly and hit the inside of the tire less often and with less force.', null],
        ['Some of the air particles changed into liquid and left the tire.', 'M_PHYS2CHEM']],
    k: 2,
    why: 'Cooler air has particles with less energy of motion. Slower particles collide with the tire walls less often and with less force, so the pressure drops. The particles do not shrink or leave.' });

  Q.push({ id: 'W2-11', wk: 2, std: 'S8P1.b', dok: 3, t: 'mp', p: 2,
    stem: 'The models show the same sample of water at three different temperatures at normal air pressure. Each ball is a water particle.',
    fig: FIG.panels([
      { svg: FIG.stateBox('solid', { seed: 15 }), cap: 'Model 1: -20 °C' },
      { svg: FIG.stateBox('liquid', { seed: 16 }), cap: 'Model 2: 25 °C' },
      { svg: FIG.stateBox('gas', { seed: 17, n: 12 }), cap: 'Model 3: 110 °C' }]),
    parts: [
      { q: 'Part A: Which statement correctly compares the thermal energy of the water in the three models?',
        o: [['Model 1 has the most thermal energy because its particles are closest together.', 'M_DIRECTION'],
            ['Model 2 has the most thermal energy because liquids are the most common state.', 'M_READ'],
            ['All three models have the same thermal energy because the particles are the same.', 'M_SIZE'],
            ['Model 3 has the most thermal energy because its particles move the fastest.', null]], k: 3 },
      { q: 'Part B: Which statement best explains why the particles in Model 3 are farther apart than the particles in Model 2?',
        o: [['The particles in Model 3 moved fast enough to overcome the forces holding them close together.', null],
            ['The particles in Model 3 got larger and pushed each other apart.', 'M_SIZE'],
            ['The particles in Model 3 are a different substance than the particles in Model 2.', 'M_PHYS2CHEM'],
            ['Thermal energy was removed from the particles in Model 3.', 'M_DIRECTION']], k: 0 }],
    why: 'Part A: More thermal energy means faster particle motion, so Model 3 (steam) has the most. Part B: The particles gained enough energy to pull away from each other. They did not change size or kind.' });

  Q.push({ id: 'W2-12', wk: 2, std: 'S8P1.b', dok: 2, t: 'mc', p: 1,
    stem: 'Stars such as the Sun are made mostly of plasma. Which statement describes the particles in plasma?',
    o: [['They are close together and vibrate in fixed positions.', 'M_STATES'],
        ['They move extremely fast and are far apart, and some have lost electrons so they are electrically charged.', null],
        ['They are close together, slide past one another, and have no charge.', 'M_STATES'],
        ['They move freely like gas particles, but none of them are charged.', 'M_PLASMA']],
    k: 1,
    why: 'Plasma has so much energy that electrons break away from atoms, leaving charged particles that move extremely fast. Choice D describes an ordinary gas.' });

  Q.push({ id: 'W2-13', wk: 2, std: 'S8P1.b', dok: 2, t: 'dd', p: 2,
    stem: 'A student removes thermal energy from a sealed container of steam (water as a gas).',
    cloze: 'As thermal energy is removed, the motion of the water particles {0}. The particles move {1}, and the steam can change into {2}.',
    blanks: [{ o: ['increases', 'stays the same', 'decreases'], k: 2 },
             { o: ['farther apart', 'closer together', 'faster'], k: 1 },
             { o: ['a plasma', 'a different substance', 'a liquid'], k: 2 }],
    why: 'Removing thermal energy slows the particles. They move closer together, and the gas can condense into a liquid. It is still water.' });

  Q.push({ id: 'W2-14', wk: 2, std: 'S8P1.b', dok: 3, t: 'mc', p: 1,
    stem: 'The table shows the average speed of the particles in a sample of nitrogen gas at four temperatures. Based on the pattern in the data, which prediction is most reasonable for the average particle speed of the same gas at 200 °C?',
    fig: FIG.table(['Temperature (°C)', 'Average particle speed (m/s)'], [['0', '493'], ['20', '511'], ['50', '537'], ['100', '577']], { cap: 'Nitrogen gas particle speed' }),
    o: [['Less than 493 m/s, because the gas is hotter', 'M_DIRECTION'],
        ['Between 537 m/s and 577 m/s', 'M_READ'],
        ['More than 577 m/s', null],
        ['Exactly 577 m/s, because the speed stops changing above 100 °C', 'M_OVER']],
    k: 2,
    why: 'The data show that as temperature rises, the particle speed rises. At 200 °C the gas is hotter than at 100 °C, so the speed should be greater than 577 m/s. Nothing in the data suggests the speed stops changing.' });

  Q.push({ id: 'W2-15', wk: 2, std: 'S8P1.b', dok: 3, t: 'mc', p: 1,
    stem: 'A student says, "When water boils, the water molecules break apart into hydrogen atoms and oxygen atoms." Which statement best evaluates the student’s claim?',
    o: [['The claim is correct because boiling is a chemical change.', 'M_PHYS2CHEM'],
        ['The claim is incorrect because water molecules get larger when they boil.', 'M_SIZE'],
        ['The claim is correct because gases are always made of single atoms.', 'M_ELCOMP'],
        ['The claim is incorrect because boiling only changes the motion and spacing of the molecules, which are still water molecules.', null]],
    k: 3,
    why: 'Boiling adds thermal energy, so the molecules move faster and spread farther apart. They are still water molecules, so no new substance forms.' });
})();
/* ---------------- WEEK 3: Physical and Chemical Properties and Changes (S8P1.c, d, f) ---------------- */
(function () {
  Q.push({ id: 'W3-01', wk: 3, std: 'S8P1.c', dok: 1, t: 'mc', p: 1,
    stem: 'Which is a physical property of a substance?',
    o: [['Combustibility', 'M_PROP'], ['Melting point', null], ['Reactivity with acid', 'M_PROP'], ['Ability to rust', 'M_PROP']],
    k: 1,
    why: 'A physical property can be observed or measured without changing the substance into a new one. Melting point is physical. Combustibility, reactivity, and rusting can only be observed when the substance reacts, so they are chemical properties.' });

  Q.push({ id: 'W3-02', wk: 3, std: 'S8P1.c', dok: 1, t: 'dnd', p: 1,
    stem: 'Move the labels into the table to show whether each property is a physical property or a chemical property.',
    cols: ['Property', 'Type of property'],
    rows: ['Density', 'Combustibility (the ability to burn in oxygen)', 'Boiling point'],
    chips: ['physical property', 'chemical property'],
    k: [0, 1, 0], reuse: true,
    why: 'Density and boiling point are measured without changing the substance (physical). Combustibility describes how the substance reacts with oxygen (chemical).' });

  Q.push({ id: 'W3-03', wk: 3, std: 'S8P1.c', dok: 2, t: 'mc', p: 1,
    stem: 'A teacher gives a student a clear, unlabeled liquid. The student measures a density of 0.79 g/mL and a boiling point of 65 °C. Use the table of known liquids to identify the unknown liquid.',
    fig: FIG.table(['Liquid', 'Density (g/mL)', 'Boiling point (°C)'], [
      ['Ethanol', '0.79', '78'], ['Methanol', '0.79', '65'], ['Acetone', '0.78', '56'], ['Isopropyl alcohol', '0.79', '83'], ['Water', '1.00', '100']], { cap: 'Properties of known liquids' }),
    o: [['Ethanol', 'M_ONEPROP'], ['Isopropyl alcohol', 'M_ONEPROP'], ['Methanol', null], ['Water', 'M_READ']],
    k: 2,
    why: 'Three liquids have a density of 0.79 g/mL, so density alone is not enough. Only methanol also has a boiling point of 65 °C. Using more than one property identifies the liquid.' });

  Q.push({ id: 'W3-04', wk: 3, std: 'S8P1.c', dok: 2, t: 'mc', p: 1,
    stem: 'A student measures two metal samples. Which statement is correct?',
    fig: FIG.table(['Sample', 'Mass (g)', 'Volume (mL)'], [['P', '40', '10'], ['Q', '40', '20']], { cap: 'Mass and volume of two metal samples' }),
    o: [['Sample Q has a greater density because it has a larger volume.', 'M_READ'],
        ['The samples have the same density because they have the same mass.', 'M_READ'],
        ['The samples must be the same metal because their masses are equal.', 'M_READ'],
        ['Sample P has a greater density because the same mass is packed into a smaller volume.', null]],
    k: 3,
    why: 'Density is mass divided by volume. Sample P is 40 g in 10 mL (4 g/mL). Sample Q is 40 g in 20 mL (2 g/mL). The same mass in less space means a greater density.' });

  Q.push({ id: 'W3-05', wk: 3, std: 'S8P1.c', dok: 2, t: 'mc', p: 1,
    stem: 'A student measures the density of a small piece of aluminum (10 g) and a large piece of aluminum (50 g). Both pieces have a density of 2.7 g/mL. What does this show?',
    o: [['Density is a property of the substance and does not depend on the amount of it.', null],
        ['Larger pieces of a metal always have a greater density.', 'M_AMOUNT'],
        ['The larger piece must be less dense because it is heavier.', 'M_AMOUNT'],
        ['The two pieces have the same density only because they have the same shape.', 'M_READ']],
    k: 0,
    why: 'Properties such as density are characteristic of the substance. A small piece and a large piece of the same material have the same density.' });

  Q.push({ id: 'W3-06', wk: 3, std: 'S8P1.c', dok: 3, t: 'mc', p: 1,
    stem: 'A student was given three unlabeled white powders and asked to write a procedure to help describe properties of the powders. The equipment available in the lab is shown. The student wrote the first three steps. Which additional materials and additional step should be added to help the student describe a chemical property of the powders?',
    fig: '<div class="splitbox">' +
      FIG.box('Available Equipment', ['safety goggles and gloves', 'beakers and test tubes', 'hand lens', 'digital balance', 'dropper bottle of vinegar', 'dropper bottle of water'], { list: true }) +
      FIG.box('Procedure', ['<b>step 1.</b> Put on safety goggles and gloves.', '<b>step 2.</b> Observe the color and crystal shape of each powder with a hand lens.', '<b>step 3.</b> Find the mass of one level scoop of each powder.', '<b>step 4.</b> ?']) + '</div>',
    o: [['<b>materials:</b> water and a stirring rod<br><b>step 4.</b> Stir a spoonful of each powder into separate beakers of water and observe which powders dissolve.', 'M_PROP'],
        ['<b>materials:</b> hand lens and ruler<br><b>step 4.</b> Measure the length of the crystals in each powder.', 'M_DESIGN'],
        ['<b>materials:</b> heat source and thermometer<br><b>step 4.</b> Add heat to each powder and record the temperature at which each powder melts.', 'M_PROP'],
        ['<b>materials:</b> dropper bottle of vinegar and test tubes<br><b>step 4.</b> Add a small amount of each powder to separate test tubes that contain 10 drops of vinegar and observe whether bubbles form.', null]],
    k: 3,
    why: 'A chemical property is observed when a substance reacts. Adding vinegar and watching for a gas (bubbles) tests how each powder reacts. Dissolving, melting point, and crystal size are physical properties.' });

  Q.push({ id: 'W3-07', wk: 3, std: 'S8P1.d', dok: 2, t: 'mc', p: 1,
    stem: 'Which observation is the best evidence that a chemical change has occurred?',
    o: [['An ice cube melts in a drink.', 'M_PHYS2CHEM'],
        ['Sugar seems to disappear when it is stirred into water.', 'M_MIXCHEM'],
        ['Two clear liquids are mixed and a solid forms in the mixture.', null],
        ['A rubber band stretches when it is pulled.', 'M_LOOKS']],
    k: 2,
    why: 'A solid forming when two liquids are mixed (a precipitate) shows that a new substance formed. Melting, dissolving, and stretching change the form or arrangement but not the identity of the substance.' });

  Q.push({ id: 'W3-08', wk: 3, std: 'S8P1.d', dok: 2, t: 'ms', p: 1, pick: 2,
    stem: 'Which TWO changes are chemical changes?',
    o: [['An iron nail rusts.', null], ['Water freezes into ice.', 'M_PHYS2CHEM'], ['Sugar dissolves in hot tea.', 'M_MIXCHEM'], ['Aluminum foil is crumpled into a ball.', 'M_LOOKS'], ['Wood burns in a campfire.', null]],
    k: [0, 4],
    why: 'Rusting and burning make new substances with new properties. Freezing, dissolving, and crumpling only change the state, mixture, or shape.' });

  Q.push({ id: 'W3-09', wk: 3, std: 'S8P1.d', dok: 2, t: 'dnd', p: 2,
    stem: 'Move the labels into the table to classify each change as a physical change or a chemical change.',
    cols: ['Change', 'Type of change'],
    rows: ['Salt dissolves in water', 'An antacid tablet fizzes when dropped in water', 'Wax melts near a flame', 'A cut banana turns brown'],
    chips: ['physical change', 'chemical change'],
    k: [0, 1, 0, 1], reuse: true,
    why: 'Dissolving salt and melting wax do not make new substances (physical). The fizzing tablet makes a gas, and the browning banana makes new substances (chemical).' });

  Q.push({ id: 'W3-10', wk: 3, std: 'S8P1.d', dok: 3, t: 'mc', p: 1,
    stem: 'A student mixes two clear liquids in a beaker. The mixture turns yellow, gives off a gas, and the beaker becomes warm even though it was not heated. Which argument best supports the claim that a chemical change occurred?',
    o: [['A chemical change occurred because the two liquids were mixed together.', 'M_MIXCHEM'],
        ['A physical change occurred because the mixture is still a liquid.', 'M_LOOKS'],
        ['A physical change occurred because color is a physical property.', 'M_LOOKS'],
        ['A chemical change occurred because a gas formed and the temperature rose without outside heating, which are signs that new substances formed.', null]],
    k: 3,
    why: 'A gas forming and an unexpected temperature change are evidence of new substances. Mixing alone does not make a change chemical, and staying a liquid does not make it physical.' });

  Q.push({ id: 'W3-11', wk: 3, std: 'S8P1.d', dok: 3, t: 'mp', p: 2,
    stem: 'A student heated a shiny gray strip of magnesium metal in a flame. The strip gave off a bright white light and turned into a dull white powder. The table compares the properties before and after.',
    fig: FIG.table(['Property', 'Magnesium strip (before)', 'White powder (after)'], [
      ['Appearance', 'shiny gray metal', 'dull white powder'], ['Melting point', '650 °C', '2,852 °C'], ['Conducts electricity', 'yes', 'no']], { cap: 'Properties before and after heating' }),
    parts: [
      { q: 'Part A: Which type of change occurred?',
        o: [['A physical change', 'M_LOOKS'], ['A chemical change', null], ['A change that is both physical and chemical', 'M_LOOKS'], ['A change that is neither physical nor chemical', 'M_LOOKS']], k: 1 },
      { q: 'Part B: Which evidence from the table best supports the answer to Part A?',
        o: [['The white powder looks different from the strip.', 'M_LOOKS'],
            ['The strip was heated in a flame.', 'M_LOOKS'],
            ['The powder has a different melting point and does not conduct electricity, so it is a new substance with different properties.', null],
            ['The mass of the strip did not change.', 'M_READ']], k: 2 }],
    why: 'A new substance has different characteristic properties. The powder has a much higher melting point and does not conduct electricity, so it is not magnesium anymore. A change in appearance alone is not enough evidence, and the table gives no mass data.' });

  Q.push({ id: 'W3-12', wk: 3, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'A student puts baking soda and vinegar in a flask and seals the opening with a balloon so that no gas can escape. The flask, its contents, and the balloon have a mass of 150.0 g before mixing. After mixing, the balloon inflates with gas. What is the mass of the flask, its contents, and the balloon after the reaction, and why?',
    o: [['150.0 g, because no matter entered or left the closed system and the atoms were only rearranged', null],
        ['Less than 150.0 g, because the gas that formed has no mass', 'M_LOSS'],
        ['Less than 150.0 g, because some matter was destroyed in the reaction', 'M_LOSS'],
        ['More than 150.0 g, because new matter was created in the reaction', 'M_NEWMATTER']],
    k: 0,
    why: 'In a closed system the total mass stays the same. The gas does have mass, and it is trapped in the balloon. Atoms are rearranged into new substances, not created or destroyed.' });

  Q.push({ id: 'W3-13', wk: 3, std: 'S8P1.f', dok: 3, t: 'mc', p: 1,
    stem: 'A student mixed baking soda and vinegar in two trials. The same amounts of the same materials were used in both trials. Which explanation best accounts for the lower mass after Trial 2?',
    fig: FIG.table(['Trial', 'Container', 'Mass before (g)', 'Mass after (g)'], [['1', 'closed with a stopper', '85.2', '85.2'], ['2', 'open to the air', '85.2', '83.7']], { cap: 'Mass before and after mixing' }),
    o: [['Matter was destroyed in Trial 2 but not in Trial 1.', 'M_LOSS'],
        ['Gas formed in the reaction escaped from the open container, so its mass was no longer measured.', null],
        ['The reaction only happened in Trial 1.', 'M_READ'],
        ['Less matter reacted in Trial 2 because the container was open.', 'M_READ']],
    k: 1,
    why: 'The reaction made a gas. In the open container the gas escaped and took its mass with it. In the closed container the gas stayed, so the total mass did not change. Matter was not destroyed in either trial.' });

  Q.push({ id: 'W3-14', wk: 3, std: 'S8P1.f', dok: 2, t: 'dd', p: 1,
    stem: 'A student seals baking soda and vinegar in a plastic bag. The bag and everything in it have a mass of 62.0 g before the reaction. The bag puffs up as the reaction makes a gas.',
    cloze: 'After the reaction, the mass of the sealed bag and its contents is {0} because {1}.',
    blanks: [{ o: ['less than 62.0 g', '62.0 g', 'more than 62.0 g'], k: 1 },
             { o: ['the gas that formed has no mass', 'some of the atoms were destroyed', 'the atoms were rearranged and none left the bag'], k: 2 }],
    why: 'The bag is a closed system, so the total mass stays 62.0 g. The atoms were rearranged into new substances, and none of them left the bag.' });

  Q.push({ id: 'W3-15', wk: 3, std: 'S8P1.f', dok: 3, t: 'mp', p: 2, fixed: true,
    stem: 'A student heated iron powder and sulfur powder together in a sealed container. The reaction formed a new substance called iron sulfide. The table shows the masses.',
    fig: FIG.table(['Substance', 'Role in the reaction', 'Mass (g)'], [['Iron', 'reactant', '5.6'], ['Sulfur', 'reactant', '3.2'], ['Iron sulfide', 'product', '?']], { cap: 'Masses in the reaction' }),
    parts: [
      { q: 'Part A: What is the mass of the iron sulfide that formed?',
        o: [['2.4 g', 'M_READ'], ['5.6 g', 'M_READ'], ['8.8 g', null], ['17.6 g', 'M_READ']], k: 2 },
      { q: 'Part B: Which statement best explains the answer to Part A?',
        o: [['A new substance formed, so its mass is different from the masses of the reactants.', 'M_NEWMATTER'],
            ['Some of the sulfur atoms were destroyed during the reaction.', 'M_LOSS'],
            ['The atoms in the iron and sulfur were rearranged into iron sulfide, so the total mass stayed the same.', null],
            ['The mass of the product is the difference between the masses of the reactants.', 'M_READ']], k: 2 }],
    why: 'Matter is conserved. The total mass of the products equals the total mass of the reactants: 5.6 g + 3.2 g = 8.8 g. The atoms are rearranged into a new substance.' });
})();
/* ---------------- WEEK 4: Reactants, Products, and Chemical Equations (S8P1.f, with S8P1.e spiral) ---------------- */
(function () {
  var F = FIG.F, eq = FIG.eq;
  var one = function (svg, leg) { return '<div class="figone">' + svg + (leg || '') + '</div>'; };

  Q.push({ id: 'W4-01', wk: 4, std: 'S8P1.f', dok: 1, t: 'mc', p: 1,
    stem: 'In a chemical reaction, what are the starting substances called?',
    o: [['Products', 'M_REVERSE'], ['Mixtures', 'M_COMPMIX'], ['Reactants', null], ['Elements', 'M_ELCOMP']],
    k: 2,
    why: 'Reactants are the substances that react (the starting substances). Products are the new substances that form.' });

  Q.push({ id: 'W4-02', wk: 4, std: 'S8P1.f', dok: 1, t: 'mc', p: 1,
    stem: 'What happens to the atoms of the reactants in a chemical reaction?',
    o: [['They are destroyed.', 'M_LOSS'], ['They are rearranged to form the products.', null], ['They are created from energy.', 'M_NEWMATTER'], ['They change into atoms of different elements.', 'M_NEWMATTER']],
    k: 1,
    why: 'In a chemical reaction, atoms are rearranged into new combinations. Atoms are not destroyed, created, or changed into other elements.' });

  Q.push({ id: 'W4-03', wk: 4, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'The equation shows hydrogen reacting with oxygen to form water. How many hydrogen atoms are in the reactants?',
    fig: eq('2H2 + O2 -> 2H2O'),
    o: [['2', 'M_COEFF'], ['3', 'M_READ'], ['4', null], ['6', 'M_READ']],
    k: 2, fixed: true,
    why: 'The coefficient 2 in front of H2 means two molecules. Each molecule has 2 hydrogen atoms, so there are 2 × 2 = 4 hydrogen atoms in the reactants.' });

  Q.push({ id: 'W4-04', wk: 4, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'Methane burns in oxygen to form carbon dioxide and water. Which statement about the equation is correct?',
    fig: eq('CH4 + 2O2 -> CO2 + 2H2O'),
    o: [['The reactants have 3 oxygen atoms and the products have 4 oxygen atoms.', 'M_COEFF'],
        ['The reactants have 1 carbon atom and the products have 2 carbon atoms.', 'M_COEFF'],
        ['The products have more hydrogen atoms than the reactants.', 'M_NEWMATTER'],
        ['Both sides have 1 carbon atom, 4 hydrogen atoms, and 4 oxygen atoms.', null]],
    k: 3,
    why: 'Reactants: 1 C, 4 H, and 2 × 2 = 4 O. Products: 1 C, 2 × 2 = 4 H, and 2 + 2 = 4 O. The same atoms, in the same numbers, appear on both sides.' });

  Q.push({ id: 'W4-05', wk: 4, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a reaction between hydrogen and oxygen. Which statement about the model is correct?',
    fig: one(FIG.rxn([{ m: 'H2', n: 2 }, '+', { m: 'O2', n: 1 }, '->', { m: 'H2O', n: 2 }]), FIG.legend([['H'], ['O']])),
    o: [['The products have fewer atoms than the reactants because some atoms were used up.', 'M_LOSS'],
        ['The products have more hydrogen atoms than the reactants.', 'M_NEWMATTER'],
        ['The same number of each type of atom is present before and after the reaction.', null],
        ['The atoms in the products are different elements from the atoms in the reactants.', 'M_NEWMATTER']],
    k: 2,
    why: 'Count the atoms. Reactants: 4 hydrogen and 2 oxygen. Products: 4 hydrogen and 2 oxygen. The atoms are the same, only joined in new ways.' });

  Q.push({ id: 'W4-06', wk: 4, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a reaction between hydrogen and chlorine. How many hydrogen atoms and how many chlorine atoms are in the products?',
    fig: one(FIG.rxn([{ m: 'H2', n: 1 }, '+', { m: 'Cl2', n: 1 }, '->', { m: 'HCl', n: 2 }]), FIG.legend([['H'], ['Cl']])),
    o: [['2 hydrogen atoms and 2 chlorine atoms', null], ['1 hydrogen atom and 1 chlorine atom', 'M_COEFF'], ['2 hydrogen atoms and 1 chlorine atom', 'M_READ'], ['4 hydrogen atoms and 4 chlorine atoms', 'M_READ']],
    k: 0,
    why: 'There are 2 product molecules. Each has 1 hydrogen atom and 1 chlorine atom, so the products have 2 hydrogen atoms and 2 chlorine atoms. This matches the reactants.' });

  Q.push({ id: 'W4-07', wk: 4, std: 'S8P1.f', dok: 2, t: 'ms', p: 1, pick: 2,
    stem: 'Which TWO statements are true for every chemical reaction?',
    o: [['The products have the same properties as the reactants.', 'M_LOOKS'],
        ['The atoms in the reactants are rearranged to form the products.', null],
        ['The number of molecules always stays the same.', 'M_MOLECOUNT'],
        ['In a closed system, the total mass of the reactants equals the total mass of the products.', null],
        ['New elements are created.', 'M_NEWMATTER']],
    k: [1, 3],
    why: 'Atoms are rearranged and the total mass is conserved in a closed system. Products have different properties, new elements are not made, and the number of molecules can change (for example, 3 molecules can become 2).' });

  Q.push({ id: 'W4-08', wk: 4, std: 'S8P1.f', dok: 2, t: 'dd', p: 2,
    stem: 'Carbon burns in oxygen to form carbon dioxide.' + eq('C + O2 -> CO2'),
    cloze: 'The reactants are {0}, and the product is {1}. Both sides have 1 carbon atom and 2 oxygen atoms, so matter is {2}.',
    blanks: [{ o: ['carbon dioxide', 'carbon and oxygen', 'carbon, oxygen, and carbon dioxide'], k: 1 },
             { o: ['carbon', 'oxygen', 'carbon dioxide'], k: 2 },
             { o: ['destroyed', 'created', 'conserved'], k: 2 }],
    why: 'Carbon and oxygen start the reaction (reactants). Carbon dioxide is made (product). The atom counts match on both sides, so matter is conserved.' });

  Q.push({ id: 'W4-09', wk: 4, std: 'S8P1.f', dok: 2, t: 'dnd', p: 2,
    stem: 'Nitrogen reacts with hydrogen to make ammonia.' + eq('N2 + 3H2 -> 2NH3') + 'Move the numbers into the table to show how many atoms of each element are on each side of the equation.',
    cols: ['Atoms in the equation', 'Number of atoms'],
    rows: ['Nitrogen atoms in the reactants', 'Hydrogen atoms in the reactants', 'Nitrogen atoms in the products', 'Hydrogen atoms in the products'],
    chips: ['1', '2', '3', '6'],
    k: [1, 3, 1, 3], reuse: true,
    why: 'Reactants: N2 gives 2 nitrogen atoms, and 3H2 gives 3 × 2 = 6 hydrogen atoms. Products: 2NH3 gives 2 nitrogen atoms and 2 × 3 = 6 hydrogen atoms. The counts match.' });

  Q.push({ id: 'W4-10', wk: 4, std: 'S8P1.f', dok: 3, t: 'mc', p: 1, ext: true,
    stem: 'A student writes this equation for hydrogen reacting with oxygen to make water.' + eq('H2 + O2 -> H2O') + 'Which statement correctly evaluates the equation?',
    o: [['It is balanced because both sides contain hydrogen and oxygen.', 'M_READ'],
        ['It is not balanced because there are 2 oxygen atoms in the reactants and 1 oxygen atom in the product, so it does not show conservation of matter.', null],
        ['It is not balanced because there are more hydrogen atoms in the product.', 'M_READ'],
        ['It is balanced because matter is only conserved in the reactants.', 'M_LOSS']],
    k: 1,
    why: 'Count the atoms. Reactants: 2 H and 2 O. Product: 2 H and 1 O. An oxygen atom is missing, so the equation does not show conservation of matter.' });

  Q.push({ id: 'W4-11', wk: 4, std: 'S8P1.f', dok: 3, t: 'mc', p: 1,
    stem: 'A student burns a piece of charcoal (carbon) in a sealed jar of oxygen. The charcoal seems to disappear, but the total mass of the jar and its contents does not change. The student uses this equation as evidence.' + eq('C + O2 -> CO2') + 'Which explanation is best supported by the equation?',
    o: [['The charcoal was destroyed, but the oxygen mass made up the difference.', 'M_LOSS'],
        ['The carbon atoms combined with oxygen atoms to form carbon dioxide, so no atoms were lost and the total mass stayed the same.', null],
        ['The charcoal changed into energy, so no mass was needed.', 'M_LOSS'],
        ['The reaction made new atoms of carbon dioxide, so the mass should have increased.', 'M_NEWMATTER']],
    k: 1,
    why: 'The carbon atoms did not disappear. They joined with oxygen atoms to make carbon dioxide gas, which stayed in the sealed jar. The same atoms are present, so the total mass is the same.' });

  Q.push({ id: 'W4-12', wk: 4, std: 'S8P1.f', dok: 3, t: 'mp', p: 2,
    stem: 'A student reacted hydrogen and oxygen in a sealed container to make water.' + eq('2H2 + O2 -> 2H2O') +
      FIG.table(['Substance', 'Mass (g)'], [['Hydrogen (reactant)', '4'], ['Oxygen (reactant)', '32'], ['Water (product)', '36']], { cap: 'Masses in the reaction' }),
    parts: [
      { q: 'Part A: How many oxygen atoms are in the products?',
        o: [['1', 'M_COEFF'], ['2', null], ['3', 'M_READ'], ['4', 'M_READ']], k: 1 },
      { q: 'Part B: Which statement best uses the equation and the data to explain the masses?',
        o: [['The mass increased because new atoms of water were made.', 'M_NEWMATTER'],
            ['The water has a mass of 36 g because the atoms from the reactants were rearranged and both sides have the same number of each atom.', null],
            ['The mass of the oxygen was lost, so the water has less mass than the reactants.', 'M_LOSS'],
            ['The water has a different mass because it has different properties than hydrogen and oxygen.', 'M_READ']], k: 1 }],
    fixed: true,
    why: 'Part A: 2H2O has 2 molecules with 1 oxygen atom each, so there are 2 oxygen atoms. This matches the 2 oxygen atoms in O2. Part B: The reactants add up to 4 g + 32 g = 36 g, the same as the product. Atoms are rearranged, not created or destroyed.' });

  /* S8P1.e spiral */
  Q.push({ id: 'W4-13', wk: 4, std: 'S8P1.e', dok: 2, t: 'mc', p: 1, fixed: true,
    stem: 'The periodic table entry for lithium is shown. Which model correctly represents a neutral atom of lithium?',
    fig: '<div class="figone">' + FIG.tile('Li', 3, '6.94', 'Lithium') +
      FIG.panels([
        { svg: FIG.atomModel(3, 3, 3, { seed: 61 }), cap: 'Model A' },
        { svg: FIG.atomModel(7, 3, 7, { seed: 62 }), cap: 'Model B' },
        { svg: FIG.atomModel(3, 4, 7, { seed: 63 }), cap: 'Model C' },
        { svg: FIG.atomModel(3, 4, 3, { seed: 64 }), cap: 'Model D' }]) + FIG.ATOMKEY + '</div>',
    o: [['Model A', 'M_NUMBERS'], ['Model B', 'M_NUMBERS'], ['Model C', 'M_NUMBERS'], ['Model D', null]],
    k: 3,
    why: 'Lithium has atomic number 3, so it has 3 protons. A neutral atom has the same number of electrons (3). The atomic mass rounds to 7, so the number of neutrons is 7 - 3 = 4. Model D matches.' });

  Q.push({ id: 'W4-14', wk: 4, std: 'S8P1.e', dok: 2, t: 'mc', p: 1,
    stem: 'Part of the periodic table is shown. Which element is most likely to have chemical properties similar to chlorine (Cl)?',
    fig: '<table class="pt"><caption>Part of the periodic table</caption><thead><tr><th></th><th>Group 1</th><th>Group 2</th><th>Group 17</th><th>Group 18</th></tr></thead><tbody>' +
      '<tr><th>Period 2</th><td>' + FIG.tile('Li', 3, '6.94', 'Lithium') + '</td><td>' + FIG.tile('Be', 4, '9.01', 'Beryllium') + '</td><td>' + FIG.tile('F', 9, '19.00', 'Fluorine') + '</td><td>' + FIG.tile('Ne', 10, '20.18', 'Neon') + '</td></tr>' +
      '<tr><th>Period 3</th><td>' + FIG.tile('Na', 11, '22.99', 'Sodium') + '</td><td>' + FIG.tile('Mg', 12, '24.31', 'Magnesium') + '</td><td>' + FIG.tile('Cl', 17, '35.45', 'Chlorine') + '</td><td>' + FIG.tile('Ar', 18, '39.95', 'Argon') + '</td></tr>' +
      '<tr><th>Period 4</th><td>' + FIG.tile('K', 19, '39.10', 'Potassium') + '</td><td>' + FIG.tile('Ca', 20, '40.08', 'Calcium') + '</td><td>' + FIG.tile('Br', 35, '79.90', 'Bromine') + '</td><td>' + FIG.tile('Kr', 36, '83.80', 'Krypton') + '</td></tr></tbody></table>',
    o: [['Argon (Ar)', 'M_ROW'], ['Fluorine (F)', null], ['Sodium (Na)', 'M_ROW'], ['Calcium (Ca)', 'M_READ']],
    k: 1,
    why: 'Elements in the same column (group) have similar chemical properties. Fluorine is in the same column as chlorine. Argon and sodium are in the same row (period) as chlorine, but not the same column.' });

  Q.push({ id: 'W4-15', wk: 4, std: 'S8P1.e', dok: 3, t: 'mc', p: 1, fixed: true,
    stem: 'A student uses the periodic table entry for carbon to build a model of a neutral carbon atom. The student’s model is shown. Which statement best evaluates the model?',
    fig: '<div class="figone">' + FIG.tile('C', 6, '12.01', 'Carbon') + FIG.panels([{ svg: FIG.atomModel(6, 6, 12, { seed: 71 }), cap: 'Student model: 6 protons, 6 neutrons, 12 electrons' }]) + FIG.ATOMKEY + '</div>',
    o: [['The model has too many electrons. A neutral carbon atom has 6 electrons to match its 6 protons.', null],
        ['The model has too few protons. Carbon should have 12 protons because its atomic mass is 12.', 'M_NUMBERS'],
        ['The model is wrong because the electrons should be inside the nucleus with the protons and neutrons.', 'M_NUCLEUS'],
        ['The model is correct because the number of electrons should match the atomic mass.', 'M_NUMBERS']],
    k: 0,
    why: 'Carbon’s atomic number is 6, so it has 6 protons. A neutral atom has equal numbers of protons and electrons, so it should have 6 electrons. The 6 neutrons (12 - 6) are correct.' });
})();
/* ---------------- WEEK 5: Cumulative Review and Unit Test (S8P1.a, b, c, d, f in new situations) ---------------- */
(function () {
  var F = FIG.F, eq = FIG.eq;
  var one = function (svg, leg) { return '<div class="figone">' + svg + (leg || '') + '</div>'; };

  /* ---- a: pure substances and mixtures ---- */
  Q.push({ id: 'W5-01', wk: 5, std: 'S8P1.a', dok: 2, t: 'mc', p: 1,
    stem: 'The model shows a sample of carbonated water. Each ball is an atom. Which classification best describes the sample?',
    fig: one(FIG.molBox([['CO2', 4], ['H2O', 4]], { seed: 81 }), FIG.legend([['C'], ['O'], ['H']])),
    o: [['A compound, because it contains carbon, hydrogen, and oxygen atoms joined together', 'M_COMPMIX'],
        ['An element, because it contains only a few kinds of atoms', 'M_ELCOMP'],
        ['A homogeneous mixture of two compounds', null],
        ['A heterogeneous mixture of two elements', 'M_HETERO']],
    k: 2,
    why: 'There are two kinds of particles (carbon dioxide molecules and water molecules). Each kind has atoms of more than one element joined, so each is a compound. They are spread evenly and not joined to each other, so the sample is a homogeneous mixture of two compounds.' });

  Q.push({ id: 'W5-02', wk: 5, std: 'S8P1.a', dok: 3, t: 'mc', p: 1,
    stem: 'A student boiled three samples of each of two clear liquids and recorded the boiling points. Which conclusion is best supported by the data?',
    fig: FIG.table(['Liquid', 'Sample 1 (°C)', 'Sample 2 (°C)', 'Sample 3 (°C)'], [['M', '100.0', '100.0', '100.0'], ['N', '100.5', '101.1', '101.9']], { cap: 'Boiling points of three samples of each liquid' }),
    o: [['Liquid M is likely a pure substance because its boiling point is the same in every sample, and Liquid N is likely a mixture because its boiling point changes with the makeup of the sample.', null],
        ['Liquid M is a mixture because it boils at the same temperature every time.', 'M_READ'],
        ['Both liquids are pure substances because both of them boil.', 'M_READ'],
        ['Both liquids are mixtures because boiling separates the parts of a liquid.', 'M_COMPMIX']],
    k: 0,
    why: 'A pure substance has the same properties in every sample, including a fixed boiling point. The boiling point of Liquid N changes from sample to sample, which suggests the samples have different compositions, so it is a mixture.' });

  Q.push({ id: 'W5-03', wk: 5, std: 'S8P1.a', dok: 1, t: 'ms', p: 1, pick: 2,
    stem: 'Which TWO of these are mixtures?',
    o: [['Granite', null], ['Oxygen gas', 'M_READ'], ['Aluminum', 'M_READ'], ['Vinegar (acetic acid dissolved in water)', null], ['Carbon dioxide', 'M_COMPMIX']],
    k: [0, 3],
    why: 'Granite is made of different minerals and vinegar is a substance dissolved in water, so both are mixtures. Oxygen and aluminum are elements, and carbon dioxide is a compound.' });

  /* ---- b: particle motion ---- */
  Q.push({ id: 'W5-04', wk: 5, std: 'S8P1.b', dok: 2, t: 'mc', p: 1, fixed: true,
    stem: 'The first model shows a gas in a sealed container at 20 °C. The arrows show how fast the particles move. The gas is then heated to 80 °C. Which model best shows the gas after it was heated?',
    fig: FIG.panels([{ svg: FIG.stateBox('gas', { seed: 91, n: 8, arrows: 'med' }), cap: 'Gas at 20 °C' }], { cls: 'one-wide' }) +
      FIG.panels([
        { svg: FIG.stateBox('gas', { seed: 92, n: 8, arrows: 'tiny' }), cap: 'Model A' },
        { svg: FIG.stateBox('gas', { seed: 93, n: 8, arrows: 'long' }), cap: 'Model B' },
        { svg: FIG.stateBox('gas', { seed: 94, n: 5, arrows: 'med', r: 11 }), cap: 'Model C' },
        { svg: FIG.stateBox('liquid', { seed: 95 }), cap: 'Model D' }]),
    o: [['Model A', 'M_DIRECTION'], ['Model B', null], ['Model C', 'M_SIZE'], ['Model D', 'M_STATES']],
    k: 1,
    why: 'Heating adds thermal energy, so the particles move faster (longer arrows) but stay the same size and the same number. Model A shows slower particles, Model C shows larger particles, and Model D shows a liquid.' });

  Q.push({ id: 'W5-05', wk: 5, std: 'S8P1.b', dok: 3, t: 'mc', p: 1,
    stem: 'The label on a can of spray paint says, "Do not store near a heater or in a hot car." Which explanation uses the motion of particles to explain this warning?',
    o: [['Added thermal energy makes the gas particles move faster, so they hit the inside of the can harder and more often, and the pressure can build up.', null],
        ['Heat makes the gas particles smaller, so the can crumples.', 'M_SIZE'],
        ['Heat removes energy from the gas, so it condenses and leaks out.', 'M_DIRECTION'],
        ['Heat makes the particles stop moving, so the paint cannot be sprayed.', 'M_STILL']],
    k: 0,
    why: 'Heating the can adds thermal energy. The gas particles move faster and collide with the walls more often and with more force, so the pressure rises. The particles do not change size or stop moving.' });

  Q.push({ id: 'W5-06', wk: 5, std: 'S8P1.b', dok: 2, t: 'dnd', p: 2,
    stem: 'A student heats a substance from a very low temperature until it becomes a plasma. Move the labels into the table to show the states of matter in order from the LEAST thermal energy to the MOST thermal energy.',
    cols: ['Order', 'State of matter'],
    rows: ['Least thermal energy', 'Second', 'Third', 'Most thermal energy'],
    chips: ['gas', 'solid', 'plasma', 'liquid'],
    k: [1, 3, 0, 2], reuse: false,
    why: 'As thermal energy increases, particles move faster and spread out: solid, then liquid, then gas, then plasma.' });

  /* ---- c: properties and investigations ---- */
  Q.push({ id: 'W5-07', wk: 5, std: 'S8P1.c', dok: 2, t: 'mc', p: 1,
    stem: 'A student has an unknown metal cube. The cube has a mass of 135 g and a volume of 30 mL. Use the table to identify the metal.',
    fig: FIG.table(['Metal', 'Density (g/mL)'], [['Aluminum', '2.7'], ['Titanium', '4.5'], ['Iron', '7.9'], ['Copper', '9.0']], { cap: 'Densities of known metals' }),
    o: [['Aluminum', 'M_READ'], ['Titanium', null], ['Iron', 'M_READ'], ['Copper', 'M_READ']],
    k: 1,
    why: 'Density = mass ÷ volume = 135 g ÷ 30 mL = 4.5 g/mL. This matches titanium.' });

  Q.push({ id: 'W5-08', wk: 5, std: 'S8P1.c', dok: 3, t: 'mp', p: 2,
    stem: 'A student wants to find out whether four different metals react with vinegar. The student will place one piece of each metal in a separate test tube that contains vinegar.',
    parts: [
      { q: 'Part A: Which conditions should the student keep the same in all four test tubes?',
        o: [['The type of metal and the amount of vinegar', 'M_DESIGN'], ['The amount of vinegar and the size of each piece of metal', null], ['The type of metal and the size of each piece of metal', 'M_DESIGN'], ['The color of each metal', 'M_DESIGN']], k: 1 },
      { q: 'Part B: Which observation would be evidence that a metal reacts with vinegar?',
        o: [['The metal is shiny.', 'M_PROP'], ['The metal sinks to the bottom of the test tube.', 'M_PROP'], ['Bubbles of gas form on the surface of the metal.', null], ['The metal has a high melting point.', 'M_PROP']], k: 2 }],
    why: 'Part A: The type of metal is the variable being tested. The amount of vinegar and the size of each piece should be the same so the test is fair. Part B: Reactivity is a chemical property, and a gas forming is evidence of a reaction. Shininess, sinking, and melting point are physical properties.' });

  Q.push({ id: 'W5-09', wk: 5, std: 'S8P1.c', dok: 2, t: 'mc', p: 1,
    stem: 'A student wants to compare a chemical property of four materials. Which investigation should the student carry out?',
    o: [['Observe whether each material burns when a teacher holds a sample in a flame.', null],
        ['Measure the boiling point of each material.', 'M_PROP'],
        ['Measure the density of each material.', 'M_PROP'],
        ['Measure the melting point of each material.', 'M_PROP']],
    k: 0,
    why: 'Combustibility (the ability to burn) is a chemical property. Boiling point, density, and melting point are physical properties that can be measured without forming a new substance.' });

  /* ---- d: chemical or physical change ---- */
  Q.push({ id: 'W5-10', wk: 5, std: 'S8P1.d', dok: 2, t: 'mc', p: 1,
    stem: 'A student heats sugar in a pan. The sugar first melts into a clear liquid. As heating continues, the liquid turns brown, gives off smoke, and smells burnt. Which observation is the best evidence of a chemical change?',
    o: [['The sugar melts into a clear liquid.', 'M_PHYS2CHEM'],
        ['The pan gets hot.', 'M_LOOKS'],
        ['The liquid turns brown, gives off smoke, and smells burnt.', null],
        ['The sugar was heated for several minutes.', 'M_LOOKS']],
    k: 2,
    why: 'Melting is a physical change. A new color, smoke, and a new odor show that new substances formed, which is a chemical change.' });

  Q.push({ id: 'W5-11', wk: 5, std: 'S8P1.d', dok: 3, t: 'mc', p: 1,
    stem: 'A student leaves a dish of salt water in the sun. After several days, the water is gone and white salt crystals are left in the dish. Which claim and evidence best support the classification of this change?',
    o: [['It is a chemical change because the water disappeared.', 'M_PHYS2CHEM'],
        ['It is a chemical change because crystals formed.', 'M_LOOKS'],
        ['It is a physical change because heat from the sun was added.', 'M_LOOKS'],
        ['It is a physical change because the salt and water were only separated, and each kept its own properties.', null]],
    k: 3,
    why: 'Evaporation separated the mixture. The salt and the water vapor are the same substances that were in the salt water, so no new substance formed.' });

  Q.push({ id: 'W5-12', wk: 5, std: 'S8P1.d', dok: 2, t: 'ms', p: 1, pick: 2,
    stem: 'A student mixes two clear liquids in a beaker. Which TWO observations are evidence that a chemical change occurred?',
    o: [['A solid forms and settles to the bottom of the beaker.', null],
        ['The liquids swirl together as they are poured.', 'M_MIXCHEM'],
        ['The beaker feels warm even though it was not heated.', null],
        ['The level of liquid in the beaker rises.', 'M_LOOKS'],
        ['The mixture can be poured out of the beaker.', 'M_LOOKS']],
    k: [0, 2],
    why: 'A precipitate (a solid that forms from two liquids) and an unexpected temperature change are signs of a chemical change. Swirling, the liquid level, and pouring are not evidence of a new substance.' });

  /* ---- f: conservation of matter ---- */
  Q.push({ id: 'W5-13', wk: 5, std: 'S8P1.f', dok: 3, t: 'mc', p: 1,
    stem: 'A student burns a piece of steel wool (iron) in an open dish. The table shows the mass of the iron before burning and the mass of the solid left after burning. Which explanation best accounts for the increase in mass?',
    fig: FIG.table(['Measurement', 'Mass (g)'], [['Steel wool before burning', '5.0'], ['Solid after burning', '6.4']], { cap: 'Mass of the steel wool before and after burning' }),
    o: [['Matter was created during the reaction.', 'M_NEWMATTER'],
        ['The iron atoms became heavier when they were heated.', 'M_SIZE'],
        ['Oxygen atoms from the air joined with the iron atoms, so the solid gained the mass of the oxygen.', null],
        ['The steel wool absorbed thermal energy, and thermal energy has mass.', 'M_READ']],
    k: 2,
    why: 'The iron reacted with oxygen from the air. The oxygen atoms became part of the solid, so its mass increased by the mass of the oxygen. No matter was created. Atoms were rearranged.' });

  Q.push({ id: 'W5-14', wk: 5, std: 'S8P1.f', dok: 2, t: 'mc', p: 1,
    stem: 'When yeast is added to hydrogen peroxide, the hydrogen peroxide breaks down into water and oxygen gas.' + eq('2H2O2 -> 2H2O + O2') + 'Which statement is supported by the equation?',
    o: [['There are 2 hydrogen atoms and 2 oxygen atoms in the reactants.', 'M_COEFF'],
        ['There are 4 oxygen atoms in the reactants and 2 oxygen atoms in the products.', 'M_READ'],
        ['There are more atoms in the products than in the reactants.', 'M_NEWMATTER'],
        ['There are 4 hydrogen atoms and 4 oxygen atoms on each side of the equation.', null]],
    k: 3,
    why: 'Reactants: 2H2O2 has 4 H and 4 O. Products: 2H2O has 4 H and 2 O, and O2 adds 2 more O, for 4 H and 4 O. Both sides match, so matter is conserved.' });

  Q.push({ id: 'W5-15', wk: 5, std: 'S8P1.f', dok: 3, t: 'mp', p: 2, fixed: true,
    stem: 'Carbon monoxide reacts with oxygen. The model shows the reactants. Each ball is an atom.',
    fig: one(FIG.rxn([{ m: 'CO', n: 2 }, '+', { m: 'O2', n: 1 }]), FIG.legend([['C'], ['O']])) +
      '<p class="figcap">Possible products:</p>' +
      FIG.panels([
        { svg: FIG.molBox([['CO2', 1]], { w: 150, h: 100, seed: 101 }), cap: 'Model A' },
        { svg: FIG.molBox([['CO2', 2]], { w: 150, h: 100, seed: 102 }), cap: 'Model B' },
        { svg: FIG.molBox([['CO2', 3]], { w: 150, h: 100, seed: 103 }), cap: 'Model C' },
        { svg: FIG.molBox([['CO2', 2], ['O2', 1]], { w: 150, h: 100, seed: 104 }), cap: 'Model D' }]),
    parts: [
      { q: 'Part A: Which model correctly shows the products of the reaction?',
        o: [['Model A', 'M_LOSS'], ['Model B', null], ['Model C', 'M_NEWMATTER'], ['Model D', 'M_NEWMATTER']], k: 1 },
      { q: 'Part B: Which statement best explains the answer to Part A?',
        o: [['The atoms in the reactants are only rearranged, so the products must have 2 carbon atoms and 4 oxygen atoms.', null],
            ['Chemical reactions always make fewer molecules, so the products must have fewer atoms.', 'M_MOLECOUNT'],
            ['Oxygen atoms are used up in the reaction, so the products must have fewer oxygen atoms.', 'M_LOSS'],
            ['The products must have the same number of molecules as the reactants.', 'M_MOLECOUNT']], k: 0 }],
    why: 'Part A: The reactants have 2 carbon atoms (in 2 CO) and 4 oxygen atoms (2 in CO plus 2 in O2). Two CO2 molecules have 2 carbon atoms and 4 oxygen atoms. Part B: Atoms are conserved, so the products must contain the same atoms. The number of molecules can change (3 molecules become 2).' });
})();
