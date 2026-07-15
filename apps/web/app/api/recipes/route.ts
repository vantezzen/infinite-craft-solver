export async function GET() {
  const response = await fetch("https://icscdn.vantezzen.io/recipes.json", {
    cache: "force-cache",
  });

  return new Response(await response.text(), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
