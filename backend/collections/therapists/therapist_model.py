# Therapist Model (Schema Documentation)
# Not executable, just for structure reference
{
    fullName: String,
    email: String,
    whatsappNumber: String,
    profilePictureUrl: String,
    specialty: String,
    description: String,
    address: {
        country: String,
        city: String,
        suburb: String
    },
    services: [
        { serviceName: String, price: Decimal }
    ],
    availabilitySchedule: [
        { day: String, time: String }
    ],
    createdAt: DateTime,
    updatedAt: DateTime
}