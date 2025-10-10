import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('Admin packages API called');

    // Mock packages data for development
    const mockPackages = [
      {
        _id: '1',
        name: 'MTN 1GB Data',
        description: 'MTN 1GB data bundle',
        network: 'MTN',
        capacity: '1GB',
        price: 25,
        agentPrice: 20,
        stock: 100,
        isActive: true,
        category: 'data',
        tags: ['data', 'mtn'],
        images: [],
        salesCount: 150,
        revenue: 3750,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'AirtelTigo 2GB Data',
        description: 'AirtelTigo 2GB data bundle',
        network: 'AirtelTigo',
        capacity: '2GB',
        price: 45,
        agentPrice: 40,
        stock: 80,
        isActive: true,
        category: 'data',
        tags: ['data', 'airteltigo'],
        images: [],
        salesCount: 120,
        revenue: 5400,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        name: 'Vodafone 500MB Data',
        description: 'Vodafone 500MB data bundle',
        network: 'Vodafone',
        capacity: '500MB',
        price: 15,
        agentPrice: 12,
        stock: 50,
        isActive: true,
        category: 'data',
        tags: ['data', 'vodafone'],
        images: [],
        salesCount: 90,
        revenue: 1350,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '4',
        name: 'Telecel 3GB Data',
        description: 'Telecel 3GB data bundle',
        network: 'Telecel',
        capacity: '3GB',
        price: 60,
        agentPrice: 55,
        stock: 30,
        isActive: false,
        category: 'data',
        tags: ['data', 'telecel'],
        images: [],
        salesCount: 45,
        revenue: 2700,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      packages: mockPackages
    }, { status: 200 });

  } catch (error) {
    console.error('Admin packages API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Create package request:', body);

    // Mock package creation
    const newPackage = {
      _id: Date.now().toString(),
      ...body,
      salesCount: 0,
      revenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      package: newPackage
    }, { status: 201 });

  } catch (error) {
    console.error('Create package error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    console.log('Update package request:', body);

    // Mock package update with stock status logic
    const updatedPackage = {
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Auto-disable packages with zero stock
    if (updatedPackage.stock === 0 && updatedPackage.isActive) {
      updatedPackage.isActive = false;
      console.log('Package auto-disabled due to zero stock');
    }

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      package: updatedPackage
    }, { status: 200 });

  } catch (error) {
    console.error('Update package error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    console.log('Delete package request:', id);

    // Mock package deletion
    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete package error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}
