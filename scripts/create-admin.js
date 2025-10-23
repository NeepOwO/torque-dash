#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * Usage:
 *   node scripts/create-admin.js email@example.com password123
 * 
 * Or interactive:
 *   node scripts/create-admin.js
 */

const readline = require('readline');
const { User, sequelize } = require('../models');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin(email, password) {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            console.log('❌ User with this email already exists.');
            
            // Ask if want to make existing user admin
            const makeAdmin = await question('Make this user admin? (yes/no): ');
            
            if (makeAdmin.toLowerCase() === 'yes' || makeAdmin.toLowerCase() === 'y') {
                await existingUser.update({ role: 'admin' });
                console.log('✅ User upgraded to admin successfully!');
                console.log(`Email: ${email}`);
                console.log(`Role: admin`);
                return true;
            } else {
                console.log('Operation cancelled.');
                return false;
            }
        }
        
        // Create new admin user
        const admin = await User.create({
            email,
            password,
            role: 'admin'
        });
        
        console.log('');
        console.log('✅ Admin user created successfully!');
        console.log('=================================');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role: admin`);
        console.log('=================================');
        console.log('');
        console.log('⚠️  IMPORTANT: Save these credentials securely!');
        console.log('');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        return false;
    }
}

async function main() {
    console.log('');
    console.log('=================================');
    console.log('   Create Admin User');
    console.log('=================================');
    console.log('');
    
    let email, password;
    
    // Get email and password from arguments or prompt
    if (process.argv[2] && process.argv[3]) {
        email = process.argv[2];
        password = process.argv[3];
    } else {
        email = await question('Admin email: ');
        password = await question('Admin password (min 8 characters): ');
        
        // Validate
        if (!email || !email.includes('@')) {
            console.error('❌ Invalid email address');
            rl.close();
            process.exit(1);
        }
        
        if (!password || password.length < 8) {
            console.error('❌ Password must be at least 8 characters');
            rl.close();
            process.exit(1);
        }
    }
    
    // Connect to database
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');
        console.log('');
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        rl.close();
        process.exit(1);
    }
    
    // Create admin
    const success = await createAdmin(email, password);
    
    // Close
    rl.close();
    await sequelize.close();
    
    process.exit(success ? 0 : 1);
}

// Run
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

