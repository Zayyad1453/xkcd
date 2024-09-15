export const parseTranscript = (script) => {
  try {
    const lines = script.split("\n");
    const result = [];
    let currentPanel = null;

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.startsWith("[[") && line.endsWith("]]")) {
        // Panel description
        if (currentPanel) result.push(currentPanel);
        currentPanel = {
          description: line.slice(2, -2).trim(),
          dialogue: [],
          sounds: [],
          notes: null,
        };
      } else if (line.startsWith("<<") && line.endsWith(">>")) {
        // Sound effects
        currentPanel.sounds.push(line.slice(2, -2).trim());
      } else if (line.includes(":")) {
        // Dialogue
        const [character, dialogue] = line.split(":");
        currentPanel.dialogue.push({
          character: character.trim(),
          text: dialogue.trim(),
        });
      } else if (line.startsWith("{{") && line.endsWith("}}")) {
        // Title text or notes
        currentPanel.notes = line.slice(2, -2).trim();
      } else if (line.startsWith("((") && line.endsWith("))")) {
        // Special panel notes
        currentPanel.specialNote = line.slice(2, -2).trim();
      }
    });

    if (currentPanel) result.push(currentPanel); // Push the last panel

    return formatParsedScript(result);
  } catch (e) {
    return "Error parsing transcript";
  }
};

const formatParsedScript = (parsedScript) => {
  return parsedScript
    .map((panel) => {
      let formatted = `Panel: ${panel.description}</br></br>`;
      panel.dialogue.forEach((d) => {
        formatted += `${d.character}: ${d.text}</br></br>`;
      });
      panel.sounds.forEach((s) => {
        formatted += `Sound: ${s}</br></br>`;
      });
      if (panel.notes) {
        formatted += `Note: ${panel.notes}</br></br>`;
      }
      if (panel.specialNote) {
        formatted += `Special: ${panel.specialNote}</br></br>`;
      }
      return formatted;
    })
    .join("\n---\n");
};
