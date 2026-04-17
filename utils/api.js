export async function checkPhishingAPI(text) {
    if (!text) return false;

    try {
        const response = await fetch("http://localhost:3000/check-url", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            console.error("[API] Backend error:", response.status);
            return false;
        }

        const data = await response.json();

        return data.isDangerous || false;

    } catch (error) {
        console.error("[API] Connection failed:", error.message);
        return false;
    }
}
