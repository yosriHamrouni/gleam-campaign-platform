import Competition from '../models/Competition.js';

// 🟢 GET all competitions
export const getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find();
    res.status(200).json(competitions);
  } catch (err) {
    console.error('❌ Error fetching competitions:', err);
    res.status(500).json({ message: 'Server error fetching competitions' });
  }
};

// GET competition by ID
export const getCompetitionById = async (req, res) => {
  const { id } = req.params;
  try {
    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }
    res.status(200).json(competition);
  } catch (err) {
    console.error('Error fetching competition by id:', err);
    res.status(400).json({ message: 'Invalid competition id' });
  }
};

// 🟢 POST new competition (matches CreateCompetition.jsx)
export const createCompetition = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      startDate,
      endDate,
      entryFee,
      coverImage,
      actions
    } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required fields: title, description, startDate, endDate.'
      });
    }

    // Create a new Competition document
    const slugify = (s) =>
      String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    const shortCode = Math.random().toString(36).slice(2, 7);

    const newCompetition = new Competition({
      title,
      description,
      type: type || 'standard',
      startDate,
      endDate,
      entryFee: entryFee || 0,
      coverImage: coverImage || null,
      actions: actions || [],
      createdBy: req.user?.id || null,
      slug: slugify(title),
      shortCode,
      createdAt: new Date()
    });

    // Save to database
    const savedCompetition = await newCompetition.save();
    console.log('✅ New competition added:', savedCompetition);

    const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3008';
    const shareUrl = `${base}/competitions/${savedCompetition._id}`;
    const payload = savedCompetition.toObject ? savedCompetition.toObject() : savedCompetition;
    payload.shareUrl = shareUrl;
    res.status(201).json(payload);
  } catch (err) {
    console.error('❌ Error creating competition:', err);
    res.status(400).json({
      message: 'Error creating competition',
      error: err.message
    });
  }
};

// POST participate: increments participants and totalEntries
export const participateInCompetition = async (req, res) => {
  const { id } = req.params;
  const inc = Number(req.body?.entries ?? 1) || 1;
  try {
    const updated = await Competition.findByIdAndUpdate(
      id,
      { $inc: { participants: 1, totalEntries: inc } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Competition not found' });
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating participation:', err);
    res.status(400).json({ message: 'Invalid competition id' });
  }
};
