# Client Model (Schema Documentation)
# Not executable, just for structure reference
{
    fullName: String,
    email: String,
    whatsappNumber: String,
    address: {
        country: String,
        city: String,
        suburb: String
    },
    createdAt: DateTime,
    updatedAt: DateTime
}