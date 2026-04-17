exports.verifyCrowd = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'Image data is required.' });
    }

    // Mock Deep Learning Model Integration
    // Returns peopleCount > 10 randomly as a stub, or hardcode it for demo
    // The user will replace this stub with actual ML model inferencing later
    
    // For now, let's just pretend we found a crowd if an image was successfully passed
    const peopleCount = 15;
    const crowdScore = peopleCount > 10 ? 1 : 0;
    const crowdDetected = crowdScore === 1;

    return res.json({
      success: true,
      crowdDetected,
      crowdScore,
      peopleCount
    });

  } catch (err) {
    console.error("Crowd verification failed:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
