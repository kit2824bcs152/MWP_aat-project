const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('./models/Faculty');
const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

dotenv.config();

const facultyData = [
  {
    name: 'Dr. Alan Turing',
    employeeId: 'FAC-CS-001',
    email: 'alan.turing@university.edu',
    department: 'Computer Science',
    specialization: 'Artificial Intelligence & Computation'
  },
  {
    name: 'Dr. Ada Lovelace',
    employeeId: 'FAC-CS-002',
    email: 'ada.lovelace@university.edu',
    department: 'Computer Science',
    specialization: 'Software Architecture & Algorithms'
  },
  {
    name: 'Dr. Nikola Tesla',
    employeeId: 'FAC-EE-001',
    email: 'nikola.tesla@university.edu',
    department: 'Electrical Engineering',
    specialization: 'Power Systems & Electromagnetics'
  },
  {
    name: 'Dr. Katherine Johnson',
    employeeId: 'FAC-MA-001',
    email: 'katherine.johnson@university.edu',
    department: 'Mathematics',
    specialization: 'Orbital Mechanics & Applied Mathematics'
  },
  {
    name: 'Dr. Claude Shannon',
    employeeId: 'FAC-IT-001',
    email: 'claude.shannon@university.edu',
    department: 'Information Technology',
    specialization: 'Information Theory & Cryptography'
  },
  {
    name: 'Dr. Robert Goddard',
    employeeId: 'FAC-ME-001',
    email: 'robert.goddard@university.edu',
    department: 'Mechanical Engineering',
    specialization: 'Propulsion & Thermal Dynamics'
  }
];

const studentsData = [
  {
    name: 'Alex Johnson',
    rollNumber: 'CS202301',
    email: 'alex.johnson@student.edu',
    department: 'Computer Science',
    year: 2
  },
  {
    name: 'Sophia Patel',
    rollNumber: 'CS202302',
    email: 'sophia.patel@student.edu',
    department: 'Computer Science',
    year: 3
  },
  {
    name: 'Liam Chen',
    rollNumber: 'CS202401',
    email: 'liam.chen@student.edu',
    department: 'Computer Science',
    year: 1
  },
  {
    name: 'Emma Watson',
    rollNumber: 'EE202201',
    email: 'emma.watson@student.edu',
    department: 'Electrical Engineering',
    year: 4
  },
  {
    name: 'Marcus Miller',
    rollNumber: 'EE202302',
    email: 'marcus.miller@student.edu',
    department: 'Electrical Engineering',
    year: 2
  },
  {
    name: 'Olivia Rodriguez',
    rollNumber: 'IT202301',
    email: 'olivia.rodriguez@student.edu',
    department: 'Information Technology',
    year: 3
  },
  {
    name: 'Noah Williams',
    rollNumber: 'IT202402',
    email: 'noah.williams@student.edu',
    department: 'Information Technology',
    year: 1
  },
  {
    name: 'Ava Martinez',
    rollNumber: 'ME202201',
    email: 'ava.martinez@student.edu',
    department: 'Mechanical Engineering',
    year: 4
  },
  {
    name: 'Ethan Davis',
    rollNumber: 'ME202302',
    email: 'ethan.davis@student.edu',
    department: 'Mechanical Engineering',
    year: 2
  },
  {
    name: 'Isabella Garcia',
    rollNumber: 'MA202301',
    email: 'isabella.garcia@student.edu',
    department: 'Mathematics',
    year: 3
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college_course_db';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Faculty.deleteMany({}),
      Student.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({})
    ]);

    console.log('[Seed] Inserting faculty members...');
    const createdFaculty = await Faculty.insertMany(facultyData);
    const facultyMap = {};
    createdFaculty.forEach((f) => {
      facultyMap[f.employeeId] = f._id;
    });

    console.log('[Seed] Inserting courses with assigned faculty...');
    const coursesData = [
      {
        courseName: 'Data Structures and Algorithms',
        courseCode: 'CS201',
        department: 'Computer Science',
        credits: 4,
        faculty: facultyMap['FAC-CS-002'],
        description: 'Comprehensive study of fundamental data structures, graph theory, sorting, and algorithmic complexity.'
      },
      {
        courseName: 'Artificial Intelligence Foundations',
        courseCode: 'CS305',
        department: 'Computer Science',
        credits: 3,
        faculty: facultyMap['FAC-CS-001'],
        description: 'Introduction to search heuristics, heuristic search, knowledge representation, and neural nets.'
      },
      {
        courseName: 'Full Stack Web Development',
        courseCode: 'CS410',
        department: 'Computer Science',
        credits: 4,
        faculty: facultyMap['FAC-CS-002'],
        description: 'Modern full-stack web development using React, Node.js, Express, and NoSQL databases.'
      },
      {
        courseName: 'Digital Circuits and Logic Design',
        courseCode: 'EE102',
        department: 'Electrical Engineering',
        credits: 4,
        faculty: facultyMap['FAC-EE-001'],
        description: 'Boolean algebra, combinational logic, sequential circuits, flip-flops, and FPGA architecture.'
      },
      {
        courseName: 'Microprocessors and Embedded Systems',
        courseCode: 'EE304',
        department: 'Electrical Engineering',
        credits: 3,
        faculty: facultyMap['FAC-EE-001'],
        description: 'Embedded programming, ARM microcontrollers, sensors, interrupts, and hardware interfaces.'
      },
      {
        courseName: 'Linear Algebra and Optimization',
        courseCode: 'MA201',
        department: 'Mathematics',
        credits: 3,
        faculty: facultyMap['FAC-MA-001'],
        description: 'Vector spaces, eigenvalues, matrix decompositions, and mathematical optimization techniques.'
      },
      {
        courseName: 'Network Security and Cryptography',
        courseCode: 'IT302',
        department: 'Information Technology',
        credits: 3,
        faculty: facultyMap['FAC-IT-001'],
        description: 'Principles of public key cryptography, encryption algorithms, hashing, and network protocols.'
      },
      {
        courseName: 'Thermodynamics and Heat Engines',
        courseCode: 'ME201',
        department: 'Mechanical Engineering',
        credits: 4,
        faculty: facultyMap['FAC-ME-001'],
        description: 'First and second laws of thermodynamics, entropy, power cycles, and heat transfer mechanisms.'
      }
    ];

    const createdCourses = await Course.insertMany(coursesData);
    const courseMap = {};
    createdCourses.forEach((c) => {
      courseMap[c.courseCode] = c._id;
    });

    console.log('[Seed] Inserting students...');
    const createdStudents = await Student.insertMany(studentsData);
    const studentMap = {};
    createdStudents.forEach((s) => {
      studentMap[s.rollNumber] = s._id;
    });

    console.log('[Seed] Inserting enrollments...');
    const enrollmentsData = [
      {
        student: studentMap['CS202301'],
        course: courseMap['CS201'],
        enrollmentDate: new Date('2024-01-15'),
        status: 'Completed'
      },
      {
        student: studentMap['CS202301'],
        course: courseMap['CS410'],
        enrollmentDate: new Date('2024-08-20'),
        status: 'Enrolled'
      },
      {
        student: studentMap['CS202302'],
        course: courseMap['CS305'],
        enrollmentDate: new Date('2024-08-20'),
        status: 'Enrolled'
      },
      {
        student: studentMap['CS202302'],
        course: courseMap['MA201'],
        enrollmentDate: new Date('2024-01-15'),
        status: 'Completed'
      },
      {
        student: studentMap['CS202401'],
        course: courseMap['CS201'],
        enrollmentDate: new Date('2024-08-22'),
        status: 'Enrolled'
      },
      {
        student: studentMap['EE202201'],
        course: courseMap['EE304'],
        enrollmentDate: new Date('2024-01-18'),
        status: 'Completed'
      },
      {
        student: studentMap['EE202302'],
        course: courseMap['EE102'],
        enrollmentDate: new Date('2024-08-25'),
        status: 'Enrolled'
      },
      {
        student: studentMap['IT202301'],
        course: courseMap['IT302'],
        enrollmentDate: new Date('2024-08-20'),
        status: 'Enrolled'
      },
      {
        student: studentMap['IT202402'],
        course: courseMap['CS201'],
        enrollmentDate: new Date('2024-08-21'),
        status: 'Dropped'
      },
      {
        student: studentMap['Ava Martinez' ? 'ME202201' : 'ME202201'],
        course: courseMap['ME201'],
        enrollmentDate: new Date('2024-01-12'),
        status: 'Completed'
      },
      {
        student: studentMap['ME202302'],
        course: courseMap['ME201'],
        enrollmentDate: new Date('2024-08-24'),
        status: 'Enrolled'
      },
      {
        student: studentMap['MA202301'],
        course: courseMap['MA201'],
        enrollmentDate: new Date('2024-08-22'),
        status: 'Enrolled'
      }
    ];

    await Enrollment.insertMany(enrollmentsData);

    console.log('----------------------------------------------------');
    console.log('[Seed] Database successfully populated!');
    console.log(`- Faculty:     ${createdFaculty.length}`);
    console.log(`- Students:    ${createdStudents.length}`);
    console.log(`- Courses:     ${createdCourses.length}`);
    console.log(`- Enrollments: ${enrollmentsData.length}`);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error populating database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
