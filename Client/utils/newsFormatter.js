export const cleanNewsDescription = (text = "") => {
  return (
    text
      // Remove excessive spaces
      .replace(/\s+/g, " ")
      // Remove navigation/menu words
      .replace(/NEP|ENG|Loading|WEBGL|PDF|A A/gi, "")
      // Remove office hours & footer blocks
      .replace(/कार्यालय समय[\s\S]*?सम्म/gi, "")
      .replace(/महत्त्वपूर्ण लिङ्कहरू[\s\S]*/gi, "")
      // Trim
      .trim()
  );
};

export const formatNewsDescription = (rawText = "") => {
  const cleaned = cleanNewsDescription(rawText);

  // Split by Nepali full stop or English period
  const splitIndex = cleaned.search(/।|\./);

  if (splitIndex === -1) {
    return {
      highlight: cleaned,
      body: "",
    };
  }

  return {
    highlight: cleaned.slice(0, splitIndex + 1),
    body: cleaned.slice(splitIndex + 1).trim(),
  };
};
