# Country to Currency Mapping for Ecstasy Retreat Booking System

country_currency = {
    "South Africa": "ZAR",
    "United States": "USD",
    "United Kingdom": "GBP",
    "Germany": "EUR",
    "France": "EUR",
    "Australia": "AUD",
    "Canada": "CAD",
    "Georgia": "GEL",
    "United Arab Emirates": "AED",
    "Brazil": "BRL",
    "Japan": "JPY",
    "India": "INR",
    "China": "CNY"
}

def get_currency_by_country(country_name):
    return country_currency.get(country_name, "USD")  # Default to USD if not found

# Quick test if run directly
if __name__ == "__main__":
    print(get_currency_by_country("South Africa"))
    print(get_currency_by_country("Germany"))
    print(get_currency_by_country("Unknown Country"))  # Should fallback to USD