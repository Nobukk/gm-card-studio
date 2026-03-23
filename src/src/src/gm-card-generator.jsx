import { useState, useRef, useCallback } from "react";
const BACKGROUNDS = [
{
id: "beach",
label: " Beach Sunrise",
description: "Golden hour at a tropical beach with gentle waves",
gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 50%, #f093fb 100%)",
emoji: " ",
},
{
id: "city",
label: " City Skyline",
description: "Neon-lit city skyline at dawn with skyscrapers",
gradient: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
emoji: " ",
},
{
id: "workspace",
label: " Cozy Workspace",
description: "Warm home office desk with morning light streaming in",
gradient: "linear-gradient(135deg, #d4a96a 0%, #8b5e3c 50%, #3d2b1f 100%)",
emoji: " ",
},
{
id: "forest",
label: " Forest Morning",
description: "Misty forest path with sunlight filtering through trees",
gradient: "linear-gradient(135deg, #56ab2f 0%, #a8e063 50%, #1a472a 100%)",
emoji: " ",
},
{
id: "cafe",
label: " Street Café",
description: "Parisian sidewalk café with cobblestones and morning buzz",
gradient: "linear-gradient(135deg, #c9a96e 0%, #7b4f2e 50%, #2c1810 100%)",
emoji: " ",
},
{
id: "rooftop",
label: " Rooftop View",
description: "Urban rooftop terrace overlooking the waking city",
gradient: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 50%, #c0392b 100%)",
emoji: " ",
},
];
const STYLE_OPTIONS = [
{ id: "anime", label: " Anime / Illustrated" },
{ id: "realistic", label: " Realistic / Photo" },
{ id: "pixel", label: " Pixel Art" },
{ id: "watercolor", label: " Watercolor" },
];
export default function GMCardGenerator() {
const [uploadedImage, setUploadedImage] = useState(null);
const [uploadedImageBase64, setUploadedImageBase64] = useState(null);
const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0]);
const [generatedImage, setGeneratedImage] = useState(null);
const [isGenerating, setIsGenerating] = useState(false);
const [error, setError] = useState(null);
const [step, setStep] = useState(1); // 1=upload, 2=customize, 3=result
const [dragOver, setDragOver] = useState(false);
const [customText, setCustomText] = useState("GM");
const fileInputRef = useRef(null);
const handleFileUpload = useCallback((file) => {
if (!file || !file.type.startsWith("image/")) {
setError("Please upload a valid image file (PNG, JPG, GIF, WEBP).");
return;
}
if (file.size > 10 * 1024 * 1024) {
setError("Image must be under 10MB.");
return;
}
setError(null);
const url = URL.createObjectURL(file);
setUploadedImage(url);
const reader = new FileReader();
reader.onload = (e) => {
const base64 = e.target.result.split(",")[1];
setUploadedImageBase64(base64);
setStep(2);
};
}, []);
reader.readAsDataURL(file);
const handleDrop = useCallback(
(e) => {
e.preventDefault();
setDragOver(false);
const file = e.dataTransfer.files[0];
handleFileUpload(file);
},
[handleFileUpload]
);
const handleGenerate = async () => {
if (!uploadedImageBase64) return;
setIsGenerating(true);
setError(null);
setGeneratedImage(null);
const prompt = `You are an expert image compositor.
The user has uploaded an image of a character or profile picture. Your task is to describe, i
The final image should show:
- The original character/avatar from the uploaded image, placed prominently in the scene
- A hand (could be the character's hand or a new stylized hand) holding a coffee mug with the
- Background: ${selectedBg.description}
- Art style: ${selectedStyle.label} style
- Mood: warm, cheerful, good morning energy
- The overall composition should feel like a personalized "GM" (Good Morning) card that someo
- Text "${customText}" should be clearly visible on the mug
Make the result look polished, fun, and shareable. The character should look natural in the s
try {
const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
"Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY || ""}`,
"HTTP-Referer": window.location.origin,
"X-Title": "GM Card Studio",
},
body: JSON.stringify({
model: "meta-llama/llama-3.2-11b-vision-instruct:free",
max_tokens: 1024,
messages: [
{
role: "user",
content: [
{
type: "image_url",
image_url: {
url: `data:image/jpeg;base64,${uploadedImageBase64}`,
},
},
{
type: "text",
text: prompt,
},
],
},
],
}),
});
const data = await response.json();
if (data.error) {
throw new Error(data.error.message || "API error occurred");
if (data.error) {
throw new Error(data.error.message || "API error");
}
}
const textContent = data.choices?.[0]?.message?.content || "Your GM card has been compo
setGeneratedImage({ description: textContent, style: selectedStyle, bg: selectedBg });
setStep(3);
} catch (err) {
setError("Something went wrong generating your GM card. Please try again.");
console.error(err);
} finally {
setIsGenerating(false);
}
};
const handleReset = () => {
setUploadedImage(null);
setUploadedImageBase64(null);
setGeneratedImage(null);
setStep(1);
setError(null);
};
return (
<div style={styles.root}>
{/* Animated background */}
<div style={styles.bgOrb1} />
<div style={styles.bgOrb2} />
<div style={styles.bgOrb3} />
{/* Header */}
<header style={styles.header}>
<div style={styles.logoMark}> </div>
<div>
<h1 style={styles.logo}>GM Card Studio</h1>
<p style={styles.tagline}>Turn your pfp into a Good Morning moment</p>
</div>
<div style={styles.badge}>AI-Powered</div>
</header>
{/* Step Indicator */}
<div style={styles.stepRow}>
{["Upload", "Customize", "Your GM Card"].map((label, i) => (
<div key={i} style={styles.stepItem}>
<div style={{
...styles.stepCircle,
background: step > i + 1 ? "#00e5a0" : step === i + 1 ? "#fff" : "rgba(255,255,
color: step > i + 1 ? "#0a0a0a" : step === i + 1 ? "#0a0a0a" : "rgba(255,255,25
border: step === i + 1 ? "2px solid #fff" : "2px solid transparent",
}}>
{step > i + 1 ? "✓" : i + 1}
</div>
<span style={{
...styles.stepLabel,
color: step === i + 1 ? "#fff" : "rgba(255,255,255,0.4)",
fontWeight: step === i + 1 ? "700" : "400",
}}>{label}</span>
{i < 2 && <div style={styles.stepLine} />}
</div>
))}
</div>
{/* Main Card */}
<main style={styles.main}>
{/* STEP 1: Upload */}
{step === 1 && (
<div style={styles.card}>
<h2 style={styles.cardTitle}>Upload Your PFP or Character</h2>
<p style={styles.cardSub}>PNG, JPG, GIF or WEBP · Max 10MB</p>
<div
style={{
...styles.dropzone,
borderColor: dragOver ? "#00e5a0" : "rgba(255,255,255,0.2)",
background: dragOver ? "rgba(0,229,160,0.08)" : "rgba(255,255,255,0.04)",
}}
onDrop={handleDrop}
onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
onDragLeave={() => setDragOver(false)}
onClick={() => fileInputRef.current?.click()}
>
<div style={styles.dropIcon}> </div>
<p style={styles.dropText}>Drop your image here or <span style={styles.dropLink
<p style={styles.dropHint}>Works great with anime avatars, cartoon characters,
<input
ref={fileInputRef}
type="file"
accept="image/*"
style={{ display: "none" }}
onChange={(e) => handleFileUpload(e.target.files[0])}
/>
</div>
{error && <div style={styles.errorBox}> {error}</div>}
<div style={styles.examplesRow}>
<span style={styles.examplesLabel}>Works with:</span>
{[" Anime pfp", " NFT avatar", " Real photo", " OC character"].map((ex
<span key={ex} style={styles.exampleChip}>{ex}</span>
))}
</div>
</div>
)}
{/* STEP 2: Customize */}
{step === 2 && (
<div style={styles.card}>
<div style={styles.previewRow}>
<img src={uploadedImage} alt="Uploaded" style={styles.previewThumb} />
<div>
<h2 style={styles.cardTitle}>Customize Your GM Card</h2>
<p style={styles.cardSub}>Choose a background and art style</p>
</div>
</div>
{/* Mug text */}
<div style={styles.section}>
<label style={styles.sectionLabel}> Mug Text</label>
<input
style={styles.textInput}
value={customText}
maxLength={6}
onChange={(e) => setCustomText(e.target.value.toUpperCase())}
placeholder="GM"
/>
</div>
<span style={styles.inputHint}>Max 6 characters · e.g. GM, WAGMI, gm fren</span
{/* Background selection */}
<div style={styles.section}>
<label style={styles.sectionLabel}> Background Scene</label>
<div style={styles.bgGrid}>
{BACKGROUNDS.map((bg) => (
<div
key={bg.id}
style={{
...styles.bgCard,
background: bg.gradient,
outline: selectedBg.id === bg.id ? "3px solid #00e5a0" : "3px solid tra
transform: selectedBg.id === bg.id ? "scale(1.04)" : "scale(1)",
}}
onClick={() => setSelectedBg(bg)}
>
<span style={styles.bgEmoji}>{bg.emoji}</span>
<span style={styles.bgLabel}>{bg.label.split(" ").slice(1).join(" ")}</sp
{selectedBg.id === bg.id && <div style={styles.bgCheck}>✓</div>}
</div>
))}
</div>
</div>
{/* Style selection */}
<div style={styles.section}>
<label style={styles.sectionLabel}> Art Style</label>
<div style={styles.styleRow}>
{STYLE_OPTIONS.map((s) => (
<button
key={s.id}
style={{
...styles.styleBtn,
background: selectedStyle.id === s.id ? "rgba(0,229,160,0.15)" : "rgba(
border: selectedStyle.id === s.id ? "1.5px solid #00e5a0" : "1.5px soli
color: selectedStyle.id === s.id ? "#00e5a0" : "rgba(255,255,255,0.7)",
}}
onClick={() => setSelectedStyle(s)}
>
{s.label}
</button>
))}
</div>
</div>
{error && <div style={styles.errorBox}> {error}</div>}
<div style={styles.btnRow}>
<button style={styles.backBtn} onClick={() => setStep(1)}>← Back</button>
<button
style={{ ...styles.generateBtn, opacity: isGenerating ? 0.7 : 1 }}
onClick={handleGenerate}
disabled={isGenerating}
>
{isGenerating ? (
<span style={styles.loadingInner}>
<span style={styles.spinner} />
Crafting your GM card...
</span>
) : " Generate GM Card →"}
</button>
</div>
</div>
)}
{/* STEP 3: Result */}
{step === 3 && generatedImage && (
<div style={styles.card}>
<div style={styles.successBadge}> Your GM Card is Ready!</div>
<h2 style={styles.cardTitle}>Here's your personalized scene</h2>
{/* Visual preview card */}
<div style={{
...styles.resultPreview,
background: generatedImage.bg.gradient,
}}>
<div style={styles.resultOverlay}>
<img src={uploadedImage} alt="Your character" style={styles.resultChar} />
<div style={styles.coffeeMugWrapper}>
<div style={styles.coffeeMugHand}> </div>
<div style={styles.coffeeMug}>
<div style={styles.mugHandle} />
<div style={styles.mugBody}>
<span style={styles.mugText}>{customText}</span>
</div>
</div>
</div>
<div style={styles.gmBanner}>{customText} frens! </div>
</div>
</div>
{/* AI description */}
<div style={styles.descriptionBox}>
<div style={styles.descriptionHeader}>
<span style={styles.aiTag}> AI Vision</span>
<span style={styles.descriptionSubtitle}>How Claude sees your GM card</span>
</div>
<p style={styles.descriptionText}>{generatedImage.description}</p>
</div>
<div style={styles.resultMeta}>
<span style={styles.metaChip}>{generatedImage.bg.label}</span>
<span style={styles.metaChip}>{generatedImage.style.label}</span>
<span style={styles.metaChip}> "{customText}" mug</span>
</div>
<div style={styles.btnRow}>
<button style={styles.backBtn} onClick={() => setStep(2)}>← Tweak it</button>
<button style={styles.generateBtn} onClick={handleReset}> Make Another</butto
</div>
</div>
)}
</main>
{/* How to deploy guide */}
<section style={styles.guideSection}>
<h2 style={styles.guideTitle}> How to Make This Site Live for Everyone</h2>
<p style={styles.guideSub}>Follow these steps — no coding experience needed!</p>
<div style={styles.stepsGrid}>
{[
{
num: "01",
title: "Get a Free OpenRouter Key",
color: "#00e5a0",
steps: [
"Go to openrouter.ai and click Sign Up",
"Create a free account — no credit card needed",
'Go to "Keys" in your dashboard',
'Click "Create Key" and copy it somewhere safe',
"Free credits are added automatically on signup!",
],
},
{
num: "02",
title: "Deploy with Vercel (Free)",
color: "#7c6aff",
steps: [
"Go to vercel.com and sign up with GitHub",
'Click "New Project" → "Import Git Repository"',
"Upload this file as a React project",
'In "Environment Variables" add: VITE_OPENROUTER_API_KEY = your key',
'Click "Deploy" — done!',
],
},
{
num: "03",
title: "Alternative: Use Netlify",
color: "#ff6b9d",
steps: [
"Go to netlify.com and create a free account",
'Drag and drop your project folder to "Sites"',
"Go to Site Settings → Environment Variables",
"Add your VITE_OPENROUTER_API_KEY there",
"Your site gets a free .netlify.app URL instantly",
],
},
{
num: "04",
title: "Share Your Site!",
color: "#ffa940",
steps: [
"Copy your live URL from Vercel or Netlify",
"Share it on Twitter / X, Discord, or Farcaster",
"Post it in your community or NFT group",
"Anyone can now use it — no sign-up needed",
"You control the API key and costs",
],
},
].map((step) => (
<div key={step.num} style={styles.guideCard}>
<div style={{ ...styles.guideNum, color: step.color }}>{step.num}</div>
<h3 style={styles.guideCardTitle}>{step.title}</h3>
<ul style={styles.guideList}>
{step.steps.map((s, i) => (
<li key={i} style={styles.guideListItem}>
<span style={{ ...styles.guideBullet, background: step.color }} />
{s}
</li>
))}
</ul>
</div>
))}
</div>
<div style={styles.tipBox}>
<span style={styles.tipIcon}> </span>
<div>
</div>
</div>
</section>
<strong style={{ color: "#ffa940" }}>100% Free:</strong>
<span style={{ color: "rgba(255,255,255,0.8)" }}> OpenRouter gives you free credi
<footer style={styles.footer}>
<p>Built with </footer>
</div>
& Claude AI · Spread the GM energy</p>
);
}
// ---- Styles ----
const styles = {
root: {
minHeight: "100vh",
background: "#080b14",
color: "#fff",
fontFamily: "'Syne', 'Space Grotesk', sans-serif",
overflowX: "hidden",
position: "relative",
},
bgOrb1: {
position: "fixed", top: "-20%", left: "-10%", width: "600px", height: "600px",
borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,160,0.12) 0%, pointerEvents: "none", zIndex: 0,
transp
},
bgOrb2: {
position: "fixed", top: "40%", right: "-15%", width: "500px", height: "500px",
borderRadius: "50%", background: "radial-gradient(circle, rgba(124,106,255,0.1) 0%, trans
pointerEvents: "none", zIndex: 0,
},
bgOrb3: {
position: "fixed", bottom: "-10%", left: "30%", width: "400px", height: "400px",
borderRadius: "50%", background: "radial-gradient(circle, rgba(255,107,157,0.08) 0%, tran
pointerEvents: "none", zIndex: 0,
},
header: {
display: "flex", alignItems: "center", gap: "16px",
padding: "28px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)",
position: "relative", zIndex: 10,
},
logoMark: { fontSize: "36px" },
logo: { margin: 0, fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" },
tagline: { margin: "2px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.45)", letterSpac
badge: {
marginLeft: "auto", padding: "5px 14px", borderRadius: "20px",
background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.3)",
color: "#00e5a0", fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em",
},
stepRow: {
display: "flex", alignItems: "center", justifyContent: "center",
gap: "0", padding: "32px 20px 0", position: "relative", zIndex: 10,
},
stepItem: { display: "flex", alignItems: "center", gap: "10px" },
stepCircle: {
width: "34px", height: "34px", borderRadius: "50%",
display: "flex", alignItems: "center", justifyContent: "center",
fontWeight: "800", fontSize: "14px", transition: "all 0.3s",
},
stepLabel: { fontSize: "13px", letterSpacing: "0.04em", transition: "all 0.3s" },
stepLine: { width: "60px", height: "1px", background: "rgba(255,255,255,0.15)", margin: "0
main: {
maxWidth: "700px", margin: "0 auto", padding: "32px 20px 40px",
position: "relative", zIndex: 10,
},
card: {
background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
border: "1px solid rgba(255,255,255,0.09)", borderRadius: "24px",
padding: "40px", boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
},
cardTitle: { margin: "0 0 6px", fontSize: "26px", fontWeight: "800", letterSpacing: "-0.5px
cardSub: { margin: "0 0 28px", color: "rgba(255,255,255,0.45)", fontSize: "14px" },
dropzone: {
border: "2px dashed", borderRadius: "18px",
padding: "52px 32px", textAlign: "center", cursor: "pointer",
transition: "all 0.25s", marginBottom: "24px",
},
dropIcon: { fontSize: "52px", marginBottom: "16px" },
dropText: { fontSize: "17px", fontWeight: "600", margin: "0 0 8px", color: "rgba(255,255,25
dropLink: { color: "#00e5a0", textDecoration: "underline", cursor: "pointer" },
dropHint: { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 },
errorBox: {
background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)",
borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#ff8080",
marginBottom: "16px",
},
examplesRow: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
examplesLabel: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
exampleChip: {
padding: "5px 12px", borderRadius: "20px",
background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
fontSize: "13px", color: "rgba(255,255,255,0.7)",
},
previewRow: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" },
previewThumb: {
width: "72px", height: "72px", borderRadius: "16px",
objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)",
},
section: { marginBottom: "28px" },
sectionLabel: {
display: "block", fontSize: "13px", fontWeight: "700",
letterSpacing: "0.06em", color: "rgba(255,255,255,0.55)",
textTransform: "uppercase", marginBottom: "12px",
},
textInput: {
background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
borderRadius: "10px", padding: "10px 16px", color: "#fff",
fontSize: "20px", fontWeight: "800", width: "120px", letterSpacing: "0.1em",
outline: "none", textAlign: "center",
},
bgGrid: {
inputHint: { display: "block", marginTop: "8px", color: "rgba(255,255,255,0.35)", fontSize:
display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
},
bgCard: {
borderRadius: "14px", padding: "20px 14px 14px", cursor: "pointer",
transition: "all 0.2s", position: "relative", textAlign: "center",
minHeight: "90px", display: "flex", flexDirection: "column",
alignItems: "center", justifyContent: "center", gap: "6px",
},
bgEmoji: { fontSize: "28px" },
bgLabel: { fontSize: "12px", fontWeight: "700", color: "rgba(255,255,255,0.9)", textShadow:
bgCheck: {
position: "absolute", top: "8px", right: "8px",
width: "22px", height: "22px", borderRadius: "50%",
background: "#00e5a0", color: "#000", fontWeight: "900",
fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center",
},
styleRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
styleBtn: {
padding: "10px 18px", borderRadius: "10px", cursor: "pointer",
fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
},
},
btnRow: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" backBtn: {
padding: "13px 24px", borderRadius: "12px",
background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)",
color: "rgba(255,255,255,0.7)", fontSize: "15px", fontWeight: "600", cursor: "pointer",
},
generateBtn: {
padding: "13px 32px", borderRadius: "12px",
background: "linear-gradient(135deg, #00e5a0, #00b4d8)",
border: "none", color: "#0a0a0a", fontSize: "15px",
fontWeight: "800", cursor: "pointer", transition: "opacity 0.2s",
letterSpacing: "-0.2px",
},
loadingInner: { display: "flex", alignItems: "center", gap: "10px" },
spinner: {
width: "16px", height: "16px", borderRadius: "50%",
border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#0a0a0a",
display: "inline-block",
animation: "spin 0.8s linear infinite",
},
successBadge: {
display: "inline-block", padding: "6px 16px", borderRadius: "20px",
background: "rgba(0,229,160,0.12)", border: "1px solid rgba(0,229,160,0.25)",
color: "#00e5a0", fontSize: "13px", fontWeight: "700", marginBottom: "12px",
},
resultPreview: {
borderRadius: "20px", overflow: "hidden", marginBottom: "24px",
minHeight: "280px", position: "relative",
},
resultOverlay: {
width: "100%", height: "100%", minHeight: "280px",
display: "flex", alignItems: "flex-end", justifyContent: "center",
gap: "20px", padding: "24px", position: "relative",
background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)",
boxSizing: "border-box",
},
resultChar: {
width: "130px", height: "130px", borderRadius: "50%",
objectFit: "cover", border: "4px solid rgba(255,255,255,0.5)",
boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
marginBottom: "0",
},
coffeeMugWrapper: {
display: "flex", flexDirection: "column", alignItems: "center",
marginBottom: "4px",
},
coffeeMugHand: { fontSize: "32px", marginBottom: "-4px" },
coffeeMug: {
width: "64px", height: "68px", position: "relative",
display: "flex", alignItems: "center", justifyContent: "center",
},
mugHandle: {
position: "absolute", right: "-14px", top: "16px",
width: "16px", height: "28px", borderRadius: "0 14px 14px 0",
border: "4px solid #c8865a", borderLeft: "none",
},
mugBody: {
width: "56px", height: "64px", borderRadius: "6px 6px 12px 12px",
background: "linear-gradient(135deg, #d4956a, #a0522d)",
display: "flex", alignItems: "center", justifyContent: "center",
boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
border: "2px solid rgba(255,255,255,0.2)",
},
mugText: {
color: "#fff", fontWeight: "900", fontSize: "13px",
letterSpacing: "0.05em", textShadow: "0 1px 3px rgba(0,0,0,0.5)",
},
gmBanner: {
position: "absolute", top: "20px", left: "50%",
transform: "translateX(-50%)", whiteSpace: "nowrap",
background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
borderRadius: "20px", padding: "8px 20px",
color: "#fff", fontWeight: "800", fontSize: "18px",
border: "1px solid rgba(255,255,255,0.2)",
},
descriptionBox: {
background: "rgba(255,255,255,0.04)", borderRadius: "14px",
border: "1px solid rgba(255,255,255,0.08)", padding: "20px",
marginBottom: "20px",
},
descriptionHeader: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12p
aiTag: {
padding: "3px 10px", borderRadius: "20px",
background: "rgba(124,106,255,0.15)", color: "#a78bfa",
fontSize: "12px", fontWeight: "700",
},
descriptionSubtitle: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
descriptionText: {
color: "rgba(255,255,255,0.75)", fontSize: "14px",
lineHeight: "1.7", margin: 0,
maxHeight: "200px", overflowY: "auto",
},
resultMeta: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" },
metaChip: {
padding: "6px 14px", borderRadius: "20px",
background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
fontSize: "13px", color: "rgba(255,255,255,0.7)",
},
// Guide section
guideSection: {
maxWidth: "900px", margin: "0 auto 60px", padding: "0 20px",
position: "relative", zIndex: 10,
},
guideTitle: {
fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px",
textAlign: "center", margin: "0 0 10px",
},
guideSub: {
textAlign: "center", color: "rgba(255,255,255,0.45)",
fontSize: "16px", margin: "0 0 36px",
},
stepsGrid: {
display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px",
},
guideCard: {
background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px",
padding: "28px",
},
guideNum: {
fontSize: "36px", fontWeight: "900", letterSpacing: "-2px",
marginBottom: "8px", lineHeight: 1,
},
guideCardTitle: {
margin: "0 0 16px", fontSize: "17px", fontWeight: "800",
color: "#fff",
},
guideList: { listStyle: "none", margin: 0, padding: 0 },
guideListItem: {
display: "flex", alignItems: "flex-start", gap: "10px",
fontSize: "14px", color: "rgba(255,255,255,0.7)",
marginBottom: "10px", lineHeight: "1.5",
},
guideBullet: {
width: "6px", height: "6px", borderRadius: "50%",
flexShrink: 0, marginTop: "6px",
},
tipBox: {
display: "flex", alignItems: "flex-start", gap: "14px",
background: "rgba(255,169,64,0.08)", border: "1px solid rgba(255,169,64,0.2)",
borderRadius: "16px", padding: "20px 24px", marginTop: "24px",
fontSize: "14px", lineHeight: "1.6",
},
tipIcon: { fontSize: "24px", flexShrink: 0 },
footer: {
textAlign: "center", padding: "32px 20px",
color: "rgba(255,255,255,0.25)", fontSize: "13px",
borderTop: "1px solid rgba(255,255,255,0.05)",
position: "relative", zIndex: 10,
},
};
