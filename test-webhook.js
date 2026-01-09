// Test script to send sample data to GoHighLevel webhook

const testData = {
  firstName: "John",
  lastName: "Smith",
  email: "john.smith@example.com",
  phone: "512-555-1234",
  company: "Test Business Inc",
  city: "Austin",
  state: "TX",
  zip: "78701",
  calculationType: "billing",
  revenueType: "monthly",
  grossRevenue: "50000",
  uncollectedBilling: "10000",
  results: {
    type: "billing",
    revenueType: "monthly",
    grossRevenue: 50000,
    potentialRevenue: 4000,
    estimatedCost: 750,
    roi: "433.33",
    details: {
      uncollectedAmount: 10000,
      collectionRate: 40,
      potentialRecovered: 4000,
      netGain: 3250
    }
  }
};

const testData2 = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane.doe@example.com",
  phone: "210-555-5678",
  company: "Sample Corp",
  city: "San Antonio",
  state: "TX",
  zip: "78205",
  calculationType: "missed-calls",
  revenueType: "yearly",
  grossRevenue: "500000",
  missedCallsPerDay: "15",
  averageTicketValue: "200",
  results: {
    type: "missed-calls",
    revenueType: "yearly",
    grossRevenue: 500000,
    potentialRevenue: 273750,
    estimatedCost: 6000,
    roi: "4462.50",
    details: {
      missedCallsPerDay: 15,
      totalMissedCalls: 5475,
      conversionRate: 25,
      potentialConversions: 1368.75,
      averageTicketValue: 200,
      potentialRevenue: 273750,
      netGain: 267750
    }
  }
};

async function sendTestData(data, testNumber) {
  console.log(`\n=== Sending Test ${testNumber} ===`);
  console.log('Data:', JSON.stringify(data, null, 2));

  try {
    const response = await fetch(
      'https://services.leadconnectorhq.com/hooks/d2K8peAv7MftCHYvXMjv/webhook-trigger/6129c432-7c72-404b-aa97-9445c2445669',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log('Response:', responseText);

    if (response.ok) {
      console.log('✓ Test successful!');
    } else {
      console.log('✗ Test failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function runTests() {
  console.log('Testing NEW GoHighLevel Webhook for ROI Calculator');
  console.log('='.repeat(50));

  // Test 1: Uncollected Billing (Monthly)
  await sendTestData(testData, 1);

  // Wait a bit between requests
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test 2: Missed Calls (Yearly)
  await sendTestData(testData2, 2);

  console.log('\n' + '='.repeat(50));
  console.log('Tests completed!');
  console.log('\nNote: Updated data structure includes:');
  console.log('- firstName & lastName (instead of name)');
  console.log('- phone, city, state, zip fields');
}

runTests();
