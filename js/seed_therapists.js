import { supabase } from "./supabase.js";

const sampleTherapists = [
  {
    display_name: "Lerato",
    town: "Rosebank",
    speciality: "Tantric Specialist",
    bio: "Expert in tantric energy, sensual healing & spiritual connection.",
    whatsapp: "27500204011",
    main_photo: "headshots/lerato.jpg"
  },
  {
    display_name: "Thandi",
    town: "Sandton",
    speciality: "Deep Tissue & Sensual Fusion",
    bio: "Sensual-deep tissue hybrid therapy for full relaxation.",
    whatsapp: "27500204011",
    main_photo: "headshots/thandi.jpg"
  },
  {
    display_name: "Nicole",
    town: "Fourways",
    speciality: "Sensual Relaxation",
    bio: "Soft-touch intimacy and connection for deep calm.",
    whatsapp: "27500204011",
    main_photo: "headshots/nicole.jpg"
  },
  {
    display_name: "Zoe",
    town: "Randburg",
    speciality: "Aromatherapy Sensualist",
    bio: "Scent-driven sensual touch therapy for ultimate bliss.",
    whatsapp: "27500204011",
    main_photo: "headshots/zoe.jpg"
  },
  {
    display_name: "Aisha",
    town: "Melrose",
    speciality: "Erotic Relaxation",
    bio: "Intimate calming touch therapy with a focus on pleasure.",
    whatsapp: "27500204011",
    main_photo: "headshots/aisha.jpg"
  },
  {
    display_name: "Bella",
    town: "Bedfordview",
    speciality: "Exotic Tantra",
    bio: "High-energy tantric movement & touch for full connection.",
    whatsapp: "27500204011",
    main_photo: "headshots/bella.jpg"
  }
];

async function seedTherapists() {
  const { data, error } = await supabase.from("therapists").insert(sampleTherapists);
  if (error) console.error("❌ Error seeding therapists:", error.message);
  else console.log("✅ Therapists seeded successfully:", data);
}

seedTherapists();
