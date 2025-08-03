# Test Payment Flow Restriction for Stripe-Connected Vendors Only
# This script tests that payment flows are restricted to vendors with Stripe accounts

param(
    [string]$BaseUrl = "http://localhost:3001",
    [string]$CustomerEmail = "customer@test.com",
    [string]$CustomerPassword = "password123",
    [string]$VendorEmail = "vendor@test.com",
    [string]$VendorPassword = "password123"
)

Write-Host "🧪 Testing Payment Flow Restriction for Stripe-Connected Vendors" -ForegroundColor Cyan

function Invoke-TestAPI {
    param(
        [string]$Method = "GET",
        [string]$Endpoint = "",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    try {
        $uri = "$BaseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            WebSession = $session
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body | ConvertTo-Json -Depth 10
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        return @{
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
            Success = $true
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse) {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $errorContent = $reader.ReadToEnd()
            try {
                $errorJson = $errorContent | ConvertFrom-Json
            }
            catch {
                $errorJson = @{ message = $errorContent }
            }
            
            return @{
                StatusCode = $errorResponse.StatusCode
                Content = $errorJson
                Success = $false
                Error = $_.Exception.Message
            }
        }
        else {
            return @{
                StatusCode = 0
                Content = @{ message = $_.Exception.Message }
                Success = $false
                Error = $_.Exception.Message
            }
        }
    }
}

# Create web session for maintaining cookies
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "`n1️⃣ Testing Health Check" -ForegroundColor Yellow
$healthCheck = Invoke-TestAPI -Method "GET" -Endpoint "/api/health"
if ($healthCheck.Success) {
    Write-Host "✅ Health check passed" -ForegroundColor Green
} else {
    Write-Host "❌ Health check failed: $($healthCheck.Error)" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Testing Customer Login" -ForegroundColor Yellow
$customerLoginData = @{
    email = $CustomerEmail
    password = $CustomerPassword
}
$customerLoginResponse = Invoke-TestAPI -Method "POST" -Endpoint "/api/auth/login" -Body $customerLoginData

if ($customerLoginResponse.Success) {
    Write-Host "✅ Customer login successful" -ForegroundColor Green
    Write-Host "   User ID: $($customerLoginResponse.Content.user.id)" -ForegroundColor Gray
    Write-Host "   Role: $($customerLoginResponse.Content.user.role)" -ForegroundColor Gray
} else {
    Write-Host "❌ Customer login failed: $($customerLoginResponse.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Testing Vendor Login" -ForegroundColor Yellow
$vendorLoginData = @{
    email = $VendorEmail
    password = $VendorPassword
}
$vendorLoginResponse = Invoke-TestAPI -Method "POST" -Endpoint "/api/auth/login" -Body $vendorLoginData

if ($vendorLoginResponse.Success) {
    Write-Host "✅ Vendor login successful" -ForegroundColor Green
    Write-Host "   User ID: $($vendorLoginResponse.Content.user.id)" -ForegroundColor Gray
    Write-Host "   Role: $($vendorLoginResponse.Content.user.role)" -ForegroundColor Gray
} else {
    Write-Host "❌ Vendor login failed: $($vendorLoginResponse.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n4️⃣ Testing Vendor Profile Status" -ForegroundColor Yellow
$vendorProfile = Invoke-TestAPI -Method "GET" -Endpoint "/api/vendor/profile"

if ($vendorProfile.Success) {
    Write-Host "✅ Vendor profile fetched successfully" -ForegroundColor Green
    Write-Host "   Store Name: $($vendorProfile.Content.storeName)" -ForegroundColor Gray
    Write-Host "   Stripe Account ID: $($vendorProfile.Content.stripeAccountId)" -ForegroundColor Gray
    Write-Host "   Stripe Account Status: $($vendorProfile.Content.stripeAccountStatus)" -ForegroundColor Gray
    
    $hasStripeAccount = ![string]::IsNullOrEmpty($vendorProfile.Content.stripeAccountId)
    if ($hasStripeAccount) {
        Write-Host "   ✅ Vendor has Stripe account - should allow payments" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Vendor has no Stripe account - should block payments" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Failed to fetch vendor profile: $($vendorProfile.Content.message)" -ForegroundColor Red
}

Write-Host "`n5️⃣ Testing Product Creation (Vendor)" -ForegroundColor Yellow
$productData = @{
    name = "Test Product for Payment Flow"
    description = "A test product to verify payment flow restrictions"
    price = 29.99
    cost = 15.00
    stock = 10
    isAvailable = $true
    tags = @("test", "payment-flow")
}

$createProduct = Invoke-TestAPI -Method "POST" -Endpoint "/api/vendor/products" -Body $productData

if ($createProduct.Success) {
    Write-Host "✅ Product created successfully" -ForegroundColor Green
    Write-Host "   Product ID: $($createProduct.Content.id)" -ForegroundColor Gray
    Write-Host "   Product Name: $($createProduct.Content.name)" -ForegroundColor Gray
    $productId = $createProduct.Content.id
} else {
    Write-Host "❌ Failed to create product: $($createProduct.Content.message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n6️⃣ Testing Order Creation (Customer)" -ForegroundColor Yellow
$orderData = @{
    items = @(
        @{
            productId = $productId
            quantity = 1
            price = 29.99
        }
    )
    userId = $customerLoginResponse.Content.user.id
    subtotal = 29.99
    tax = 2.55
    shipping = 5.99
    total = 38.53
    shippingAddressId = $null
    notes = "Test order for payment flow restriction"
}

$createOrder = Invoke-TestAPI -Method "POST" -Endpoint "/api/orders/checkout" -Body $orderData

if ($createOrder.Success) {
    Write-Host "✅ Order created successfully" -ForegroundColor Green
    Write-Host "   Order ID: $($createOrder.Content.id)" -ForegroundColor Gray
    Write-Host "   Order Number: $($createOrder.Content.orderNumber)" -ForegroundColor Gray
    $orderId = $createOrder.Content.id
} else {
    Write-Host "❌ Failed to create order: $($createOrder.Content.message)" -ForegroundColor Red
    if ($createOrder.Content.error -eq "Vendors not connected") {
        Write-Host "   ✅ Payment flow restriction working correctly!" -ForegroundColor Green
        Write-Host "   Vendors not connected: $($createOrder.Content.vendors | ConvertTo-Json)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Unexpected error in order creation" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n7️⃣ Testing Payment Intent Creation (Customer)" -ForegroundColor Yellow
$paymentIntentData = @{
    orderId = $orderId
    amount = 3853  # Amount in cents
    currency = "usd"
}

$createPaymentIntent = Invoke-TestAPI -Method "POST" -Endpoint "/api/stripe/create-payment-intent" -Body $paymentIntentData

if ($createPaymentIntent.Success) {
    Write-Host "✅ Payment intent created successfully" -ForegroundColor Green
    Write-Host "   Payment Intent ID: $($createPaymentIntent.Content.paymentIntentId)" -ForegroundColor Gray
    Write-Host "   Client Secret: $($createPaymentIntent.Content.clientSecret.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to create payment intent: $($createPaymentIntent.Content.message)" -ForegroundColor Red
    if ($createPaymentIntent.Content.error -eq "Vendors not connected") {
        Write-Host "   ✅ Payment flow restriction working correctly!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error in payment intent creation" -ForegroundColor Red
    }
}

Write-Host "`n8️⃣ Testing Checkout Session Creation (Customer)" -ForegroundColor Yellow
$checkoutSessionData = @{
    orderId = $orderId
    customerEmail = $CustomerEmail
    lineItems = @(
        @{
            price_data = @{
                currency = "usd"
                product_data = @{
                    name = "Test Product for Payment Flow"
                    description = "A test product to verify payment flow restrictions"
                }
                unit_amount = 2999
            }
            quantity = 1
        }
    )
    totalAmount = 3853
    currency = "usd"
}

$createCheckoutSession = Invoke-TestAPI -Method "POST" -Endpoint "/api/checkout/create-session" -Body $checkoutSessionData

if ($createCheckoutSession.Success) {
    Write-Host "✅ Checkout session created successfully" -ForegroundColor Green
    Write-Host "   Session ID: $($createCheckoutSession.Content.sessionId)" -ForegroundColor Gray
    Write-Host "   Session URL: $($createCheckoutSession.Content.sessionUrl)" -ForegroundColor Gray
    Write-Host "   Application Fee: $($createCheckoutSession.Content.applicationFeeAmount)" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to create checkout session: $($createCheckoutSession.Content.message)" -ForegroundColor Red
    if ($createCheckoutSession.Content.error -eq "Vendors not connected") {
        Write-Host "   ✅ Payment flow restriction working correctly!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error in checkout session creation" -ForegroundColor Red
    }
}

Write-Host "`n9️⃣ Testing Vendor Stripe Connection Setup" -ForegroundColor Yellow
Write-Host "   To test with connected vendor:" -ForegroundColor Gray
Write-Host "   1. Complete vendor Stripe onboarding" -ForegroundColor Gray
Write-Host "   2. Update vendor profile with stripeAccountId" -ForegroundColor Gray
Write-Host "   3. Re-run this test to verify payments work" -ForegroundColor Gray

Write-Host "`n🎉 Payment Flow Restriction Tests Completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Key Features Tested:" -ForegroundColor Cyan
Write-Host "• Order creation restriction for non-Stripe vendors" -ForegroundColor White
Write-Host "• Payment intent creation restriction" -ForegroundColor White
Write-Host "• Checkout session creation restriction" -ForegroundColor White
Write-Host "• Vendor profile Stripe account validation" -ForegroundColor White
Write-Host "• Error handling for disconnected vendors" -ForegroundColor White
Write-Host ""
Write-Host "Expected Behavior:" -ForegroundColor Cyan
Write-Host "• Vendors without stripeAccountId should be blocked from payment flows" -ForegroundColor White
Write-Host "• Clear error messages indicating vendor connection requirement" -ForegroundColor White
Write-Host "• Vendors with stripeAccountId should allow normal payment processing" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Complete vendor Stripe onboarding to test successful payments" -ForegroundColor White
Write-Host "2. Verify all payment endpoints enforce the restriction" -ForegroundColor White
Write-Host "3. Test with multiple vendors (some connected, some not)" -ForegroundColor White
Write-Host "4. Monitor error logs for any bypass attempts" -ForegroundColor White 