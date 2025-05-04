# Appointment Model (Schema Documentation)
# Not executable, for structure reference only
{
    therapistId: ObjectId,
    clientName: String,
    clientEmail: String,
    clientWhatsappNumber: String,
    serviceBooked: String,
    appointmentDateTime: DateTime,
    amount: Decimal,
    currency: String,
    clientLocation: {
        country: String,
        city: String,
        suburb: String
    },
    createdAt: DateTime,
    updatedAt: DateTime
}