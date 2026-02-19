export interface LksSkill {
    id: string;
    name: string;
    cluster?: string;
    description?: string;
}

// Data referenced from LKS SMK Nasional Documents (e.g., LKS 2023/2024 Guidelines, Puspresnas/BPTI)
export const lksSkills: LksSkill[] = [
    // Cluster: Construction and Building Technology
    { id: "bricklaying", name: "Bricklaying", cluster: "Construction and Building Technology" },
    { id: "cabinetmaking", name: "Cabinetmaking", cluster: "Construction and Building Technology" },
    { id: "carpentry", name: "Carpentry", cluster: "Construction and Building Technology" },
    { id: "electrical-installations", name: "Electrical Installations", cluster: "Construction and Building Technology" },
    { id: "joinery", name: "Joinery", cluster: "Construction and Building Technology" },
    { id: "landscape-gardening", name: "Landscape Gardening", cluster: "Construction and Building Technology" },
    { id: "painting-and-decorating", name: "Painting and Decorating", cluster: "Construction and Building Technology" },
    { id: "plastering-and-drywall-systems", name: "Plastering and Drywall Systems", cluster: "Construction and Building Technology" },
    { id: "plumbing-and-heating", name: "Plumbing and Heating", cluster: "Construction and Building Technology" },
    { id: "refrigeration-and-air-conditioning", name: "Refrigeration and Air Conditioning", cluster: "Construction and Building Technology" },
    { id: "wall-and-floor-tiling", name: "Wall and Floor Tiling", cluster: "Construction and Building Technology" },

    // Cluster: Creative Arts and Fashion
    { id: "fashion-technology", name: "Fashion Technology", cluster: "Creative Arts and Fashion" },
    { id: "floristry", name: "Floristry", cluster: "Creative Arts and Fashion" },
    { id: "graphic-design-technology", name: "Graphic Design Technology", cluster: "Creative Arts and Fashion" },
    { id: "jewellery", name: "Jewellery", cluster: "Creative Arts and Fashion" },
    { id: "visual-merchandising", name: "Visual Merchandising", cluster: "Creative Arts and Fashion" },
    { id: "3d-digital-game-art", name: "3D Digital Game Art", cluster: "Creative Arts and Fashion" },

    // Cluster: Information and Communication Technology
    { id: "cloud-computing", name: "Cloud Computing", cluster: "Information and Communication Technology" },
    { id: "cyber-security", name: "Cyber Security", cluster: "Information and Communication Technology" },
    { id: "it-network-systems-administration", name: "IT Network Systems Administration", cluster: "Information and Communication Technology" },
    { id: "it-software-solutions-for-business", name: "IT Software Solutions for Business", cluster: "Information and Communication Technology" },
    { id: "information-network-cabling", name: "Information Network Cabling", cluster: "Information and Communication Technology" },
    { id: "web-technologies", name: "Web Technologies", cluster: "Information and Communication Technology" },
    { id: "mobile-robotics", name: "Mobile Robotics", cluster: "Information and Communication Technology" },

    // Cluster: Manufacturing and Engineering Technology
    { id: "cnc-milling", name: "CNC Milling", cluster: "Manufacturing and Engineering Technology" },
    { id: "cnc-turning", name: "CNC Turning", cluster: "Manufacturing and Engineering Technology" },
    { id: "electronics", name: "Electronics", cluster: "Manufacturing and Engineering Technology" },
    { id: "industrial-control", name: "Industrial Control", cluster: "Manufacturing and Engineering Technology" },
    { id: "mechanical-engineering-cad", name: "Mechanical Engineering CAD", cluster: "Manufacturing and Engineering Technology" },
    { id: "mechatronics", name: "Mechatronics", cluster: "Manufacturing and Engineering Technology" },
    { id: "plastic-die-engineering", name: "Plastic Die Engineering", cluster: "Manufacturing and Engineering Technology" },
    { id: "prototype-modelling", name: "Prototype Modelling", cluster: "Manufacturing and Engineering Technology" },
    { id: "welding", name: "Welding", cluster: "Manufacturing and Engineering Technology" },
    { id: "autonomous-mobile-robotics", name: "Autonomous Mobile Robotics", cluster: "Manufacturing and Engineering Technology" },
    { id: "water-technology", name: "Water Technology", cluster: "Manufacturing and Engineering Technology" },
    { id: "metrology", name: "Metrology", cluster: "Manufacturing and Engineering Technology" },
    { id: "automation", name: "Automation", cluster: "Manufacturing and Engineering Technology" },


    // Cluster: Social and Personal Services
    { id: "beauty-therapy", name: "Beauty Therapy", cluster: "Social and Personal Services" },
    { id: "cooking", name: "Cooking", cluster: "Social and Personal Services" },
    { id: "hairdressing", name: "Hairdressing", cluster: "Social and Personal Services" },
    { id: "health-and-social-care", name: "Health and Social Care", cluster: "Social and Personal Services" },
    { id: "hotel-reception", name: "Hotel Reception", cluster: "Social and Personal Services" },
    { id: "patisserie-and-confectionery", name: "Patisserie and Confectionery", cluster: "Social and Personal Services" },
    { id: "restaurant-service", name: "Restaurant Service", cluster: "Social and Personal Services" },

    // Cluster: Transportation and Logistics
    { id: "autobody-repair", name: "Autobody Repair", cluster: "Transportation and Logistics" },
    { id: "automobile-technology", name: "Automobile Technology", cluster: "Transportation and Logistics" },
    { id: "car-painting", name: "Car Painting", cluster: "Transportation and Logistics" },
    { id: "heavy-vehicle-technology", name: "Heavy Vehicle Technology", cluster: "Transportation and Logistics" },
    { id: "aircraft-maintenance", name: "Aircraft Maintenance", cluster: "Transportation and Logistics" },

    // Specific National Skills often included
    { id: "robot-systems-integration", name: "Robot Systems Integration", cluster: "Manufacturing and Engineering Technology" },
    { id: "additive-manufacturing", name: "Additive Manufacturing", cluster: "Manufacturing and Engineering Technology" },
    { id: "industry-4.0", name: "Industry 4.0", cluster: "Manufacturing and Engineering Technology" },
    { id: "industrial-design-technology", name: "Industrial Design Technology", cluster: "Manufacturing and Engineering Technology" },
    { id: "mobile-applications-development", name: "Mobile Applications Development", cluster: "Information and Communication Technology" },
    { id: "marketing-online", name: "Marketing Online", cluster: "Social and Personal Services" },
    { id: "bilingual-secretary", name: "Bilingual Secretary", cluster: "Social and Personal Services" },
    { id: "livestock-technology", name: "Livestock Technology", cluster: "Social and Personal Services" },
    { id: "nautica", name: "Nautica", cluster: "Transportation and Logistics" },
    { id: "agronomy", name: "Agronomy", cluster: "Social and Personal Services" },
    { id: "pharmaceutical-technology", name: "Pharmaceutical Technology", cluster: "Social and Personal Services" },
];
