// Gemini API service for text improvement
const GEMINI_API_KEYS = [
  'AIzaSyD7jSzV7S-XwRa8L90KVBxM08g7LSMDeGk',
  'AIzaSyCTYH7rvcxwjemRqYO1_zy6fftpXtJ7x7s',
  'AIzaSyCwYAwZIqKE_727iTqIbYWLBvrt8ebW-0k',
  'AIzaSyC2uWuYocXExJfqQxeBaV90ZIvdx1EibCc',
  'AIzaSyDa-Ad3iE6JwBMy5mg9me2vfXbrdI3bLQo',
];

let currentKeyIndex = 0;

export async function improveTextWithGemini(text: string): Promise<string> {
  const apiKey = GEMINI_API_KEYS[currentKeyIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `حسّن هذا النص البرمجي وأصلح الأخطاء اللغوية والنحوية واجعله أكثر وضوحاً واحترافية. احتفظ باللغة الأصلية للنص:\n\n${text}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      // Try next API key if current one fails
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
      throw new Error('Failed to improve text');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error improving text:', error);
    throw error;
  }
}

export async function generatePrompt(
  tasks: string,
  mode: 'full-code' | 'code-changes' | 'notes',
  technologies: string[]
): Promise<string> {
  const apiKey = GEMINI_API_KEYS[currentKeyIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let promptInstruction = '';
  if (mode === 'full-code') {
    promptInstruction = 'اكتب برومبت برمجي كامل يطلب كتابة الكود الكامل لتنفيذ هذه المهام';
  } else if (mode === 'code-changes') {
    promptInstruction = 'اكتب برومبت برمجي يطلب تغييرات محددة في الكود لتنفيذ هذه المهام';
  } else {
    return tasks; // For notes mode, return as is
  }

  const techString = technologies.length > 0 ? `\nالتقنيات المطلوبة: ${technologies.join(', ')}` : '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${promptInstruction}:\n\n${tasks}${techString}\n\nاكتب البرومبت بشكل واضح ومنظم وجاهز للاستخدام مباشرة.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
      throw new Error('Failed to generate prompt');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}

export async function generateWorkspacePrompt(
  allTasks: { main: string; subTasks: string[] }[],
  mode: 'full-code' | 'code-changes',
  technologies: string[]
): Promise<string> {
  const apiKey = GEMINI_API_KEYS[currentKeyIndex];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // تنسيق المهام
  let formattedTasks = '';
  allTasks.forEach((task, index) => {
    formattedTasks += `${index + 1}. ${task.main}\n`;
    if (task.subTasks.length > 0) {
      task.subTasks.forEach((subTask, subIndex) => {
        formattedTasks += `   ${index + 1}.${subIndex + 1}. ${subTask}\n`;
      });
    }
  });

  let promptInstruction = '';
  if (mode === 'full-code') {
    promptInstruction = 'اكتب برومبت برمجي شامل وكامل يطلب كتابة الكود الكامل لتنفيذ جميع هذه المهام والمتطلبات في مشروع واحد متكامل';
  } else {
    promptInstruction = 'اكتب برومبت برمجي شامل يطلب تطبيق جميع التغييرات اللازمة في الكود لتنفيذ هذه المهام';
  }

  const techString = technologies.length > 0 ? `\n\nالتقنيات المطلوبة: ${technologies.join(', ')}` : '';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${promptInstruction}:\n\n${formattedTasks}${techString}\n\nاكتب البرومبت بشكل واضح ومنظم ومفصل وجاهز للاستخدام مباشرة في تطوير المشروع.`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
      throw new Error('Failed to generate workspace prompt');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating workspace prompt:', error);
    throw error;
  }
}
