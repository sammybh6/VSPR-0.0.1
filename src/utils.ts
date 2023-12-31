  export const docPR = async (
    prompt: string,
    API_KEY: string
  ) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `"## Pull Request Documentation 
                  
                  Could you generate pull request documentation highlighting the modifications made in the following files and the specific changes within them?

                  ###Title:

                  Please provide a title for the pull request according to the changes made.
                  
                  ### Modified Files and Changes:
                  
                  Please provide detailed documentation outlining the modifications made to each file and their changes listed below (in bullet points):
                  
                  ${prompt}
                  
                  ### Additional Context (if applicable):
                  
                  Add any context, explanations, or necessary information related to these modifications that would be valuable for review purposes."
                  
                  Please stick to the above mentioned format while generating the results. Don't give any codeblocks.`,
                },
              ],
            },
          ],
        }),
      }
    );
  
    const data : any = await response.json();
    if(!data.candidates[0].content.parts[0].text) {
      return "Error in generating documentation. Please try again.";
    }
    return data.candidates[0].content.parts[0].text;
  };