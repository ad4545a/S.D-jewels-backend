$baseUrl = "http://localhost:5000/api"

Write-Host "1. Testing Root Endpoint..."
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "Success: $response" -ForegroundColor Green
} catch {
    Write-Host "Failed to connect to server: $_" -ForegroundColor Red
    exit
}

Write-Host "`n2. Registering User..."
$user = @{
    name = "Test User"
    email = "testrun_" + (Get-Random) + "@example.com"
    password = "password123"
}
$jsonUser = $user | ConvertTo-Json
try {
    $regResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $jsonUser -ContentType "application/json"
    Write-Host "User Registered: $($regResponse.email)" -ForegroundColor Green
    $token = $regResponse.token
} catch {
    Write-Host "Registration Failed: $_" -ForegroundColor Red
    exit
}

Write-Host "`n3. Logging In..."
$login = @{
    email = $user.email
    password = "password123"
}
$jsonLogin = $login | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/users/login" -Method Post -Body $jsonLogin -ContentType "application/json"
    Write-Host "Login Success. Token acquired." -ForegroundColor Green
} catch {
    Write-Host "Login Failed: $_" -ForegroundColor Red
}

Write-Host "`n4. Fetching Products..."
try {
    $products = Invoke-RestMethod -Uri "$baseUrl/products" -Method Get
    Write-Host "Products Fetched: $($products.Count)" -ForegroundColor Green
} catch {
    Write-Host "Fetch Products Failed: $_" -ForegroundColor Red
}

Write-Host "`n5. Creating Order (Mock)..."
$headers = @{
    Authorization = "Bearer $token"
}
$order = @{
    orderItems = @(
        @{
            name = "Test Ring"
            qty = 1
            image = "/images/sample.jpg"
            price = 100
            product = "60d0fe4f5311236168a109ca" # Mock ID
        }
    )
    shippingAddress = @{
        address = "123 Test St"
        city = "Test City"
        postalCode = "12345"
        country = "Test Country"
    }
    paymentMethod = "PayPal"
    itemsPrice = 100
    taxPrice = 10
    shippingPrice = 0
    totalPrice = 110
}
$jsonOrder = $order | ConvertTo-Json -Depth 5
try {
    $orderResponse = Invoke-RestMethod -Uri "$baseUrl/orders" -Method Post -Body $jsonOrder -ContentType "application/json" -Headers $headers
    Write-Host "Order Created: ID $($orderResponse._id)" -ForegroundColor Green
} catch {
    Write-Host "Create Order Failed: $_" -ForegroundColor Red
}
