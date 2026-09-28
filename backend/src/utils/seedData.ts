/**
 * utils/seedData.ts
 * Seeds default administrator, veterinarians, and services if database is empty.
 */

import User from '../common/authentication/user.model';
import Veterinarian from '../functions/function2-veterinarians/veterinarian.model';
import Service from '../functions/function5-services/service.model';

export const seedDatabase = async (): Promise<void> => {
  try {
    // 1. Seed Default Admin
    const adminExists = await User.findOne({ email: 'admin@petcare.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@petcare.com',
        password: 'Admin@123',
        role: 'admin',
        isActive: true,
        phone: '+1 (555) 019-9999',
      });
      console.log('✅ Default Admin seeded: admin@petcare.com / Admin@123');
    }

    // 2. Seed Certified Veterinarians
    const vetCount = await Veterinarian.countDocuments();
    if (vetCount === 0) {
      const vetUsersData = [
        {
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.jenkins@petcare.com',
          password: 'Password@123',
          role: 'veterinarian' as const,
          phone: '+1 (555) 234-5678',
          profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
        },
        {
          name: 'Dr. Marcus Vance',
          email: 'marcus.vance@petcare.com',
          password: 'Password@123',
          role: 'veterinarian' as const,
          phone: '+1 (555) 876-5432',
          profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        },
        {
          name: 'Dr. Emily Chen',
          email: 'emily.chen@petcare.com',
          password: 'Password@123',
          role: 'veterinarian' as const,
          phone: '+1 (555) 345-6789',
          profileImage: 'https://images.unsplash.com/photo-1594824813579-9944c5ffc02c?w=400',
        },
      ];

      for (const vetData of vetUsersData) {
        let user = await User.findOne({ email: vetData.email });
        if (!user) {
          user = await User.create(vetData);
        }

        const specialization =
          vetData.name === 'Dr. Sarah Jenkins'
            ? 'General Practice'
            : vetData.name === 'Dr. Marcus Vance'
            ? 'Surgery'
            : 'Dermatology';

        const clinic =
          vetData.name === 'Dr. Sarah Jenkins'
            ? 'PawCare Veterinary Hospital'
            : vetData.name === 'Dr. Marcus Vance'
            ? 'Metropolitan Animal Surgical Center'
            : 'Healthy Paws Wellness Clinic';

        const fee = vetData.name === 'Dr. Marcus Vance' ? 95 : 65;

        await Veterinarian.create({
          userId: user._id,
          name: vetData.name,
          specialization,
          qualification: 'DVM, MRCVS',
          experience: specialization === 'Surgery' ? 12 : 8,
          clinicName: clinic,
          phone: vetData.phone,
          location: 'Downtown Animal Health District',
          consultationFee: fee,
          profileImage: vetData.profileImage,
          description: `Certified specialist dedicated to canine and feline wellness, diagnostic care, and surgical excellence.`,
          availability: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00' },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
            { day: 'Friday', startTime: '09:00', endTime: '16:00' },
          ],
        });
      }
      console.log('✅ Certified Veterinarians seeded successfully.');
    }

    // 3. Seed Pet Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([
        {
          name: 'Full Spa & Grooming Package',
          category: 'Grooming',
          price: 65,
          duration: 75,
          provider: 'PetCare Spa Lounge',
          availability: true,
          image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500',
          description: 'Includes organic bath, breed-specific styling, blow dry, ear cleaning, and sanitary trim.',
        },
        {
          name: 'Hydrotherapy & Deep Coat Wash',
          category: 'Bathing',
          price: 45,
          duration: 45,
          provider: 'PetCare Wellness Center',
          availability: true,
          image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500',
          description: 'Warm hydro-massage bath with hypoallergenic conditioning shampoo, gentle de-shedding, and scent spritz.',
        },
        {
          name: 'Gentle Nail Trimming & Paw Care',
          category: 'Nail Trimming',
          price: 25,
          duration: 20,
          provider: 'PetCare Mobile Clinic',
          availability: true,
          image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500',
          description: 'Precision nail clipping, edge filing, and soothing paw pad organic balm moisturizing.',
        },
        {
          name: 'Puppy & Dog Obedience Training',
          category: 'Training',
          price: 80,
          duration: 60,
          provider: 'Pawsome Academy',
          availability: true,
          image: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=500',
          description: 'Positive reinforcement training focusing on leash manners, recall commands, and impulse control.',
        },
        {
          name: 'Luxury Overnight Suite Boarding',
          category: 'Boarding',
          price: 70,
          duration: 1440,
          provider: 'PetCare Hotel & Resort',
          availability: true,
          image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500',
          description: 'Private climate-controlled suite, 24/7 webcams, gourmet treats, and 4 daily play sessions.',
        },
      ]);
      console.log('✅ Popular Pet Services seeded successfully.');
    }
  } catch (error) {
    console.error('⚠️ Database seeding encountered error:', error);
  }
};

export default seedDatabase;
