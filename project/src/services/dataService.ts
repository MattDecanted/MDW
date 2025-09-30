// Data Service Layer - Updated for Supabase compatibility
// This provides fallback data when Supabase is not connected

import { Course, Module, Quiz, UserProgress, QuizAttempt } from '../types';

// Utility functions
const generateUUID = () => crypto.randomUUID();
const getCurrentTimestamp = () => new Date().toISOString();

// Mock data with proper UUIDs


// Generic storage functions using localStorage as fallback
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Course operations
export const courseService = {
  getAll: (): Course[] => {
    const stored = getFromStorage<Course>('matt_decanted_courses');
    return stored.length > 0 ? stored : [];

  },

  getById: (id: string): Course | null => {
    const courses = courseService.getAll();
    return courses.find(c => c.id === id) || null;
  },

  create: (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Course => {
    const courses = courseService.getAll();
    const newCourse: Course = {
      ...courseData,
      id: crypto.randomUUID(), // Generate proper UUID for new courses
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };
    
    courses.push(newCourse);
    saveToStorage('matt_decanted_courses', courses);
    return newCourse;
  },

  update: (id: string, updates: Partial<Course>): Course | null => {
    const courses = courseService.getAll();
    const index = courses.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    courses[index] = {
      ...courses[index],
      ...updates,
      updated_at: getCurrentTimestamp(),
    };
    
    saveToStorage('matt_decanted_courses', courses);
    return courses[index];
  },

  delete: (id: string): boolean => {
    const courses = courseService.getAll();
    const filteredCourses = courses.filter(c => c.id !== id);
    
    if (filteredCourses.length === courses.length) return false;
    
    saveToStorage('matt_decanted_courses', filteredCourses);
    return true;
  },
};

// Module operations
export const moduleService = {
  getByCourseId: (courseId: string): Module[] => {
    const stored = getFromStorage<Module>('matt_decanted_modules');
    const modules = stored.length > 0 ? stored : [];

    return modules
      .filter(m => m.course_id === courseId)
      .sort((a, b) => a.order_index - b.order_index);
  },

  getById: (id: string): Module | null => {
    const stored = getFromStorage<Module>('matt_decanted_modules');
   const modules = stored.length > 0 ? stored : [];

     return modules.find(m => m.id === id) || null;
  },

  create: (moduleData: Omit<Module, 'id' | 'created_at' | 'updated_at'>): Module => {
    const modules = getFromStorage<Module>('matt_decanted_modules');
    const newModule: Module = {
      ...moduleData,
      id: crypto.randomUUID(), // Generate proper UUID for new modules
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
    };
    
    modules.push(newModule);
    saveToStorage('matt_decanted_modules', modules);
    return newModule;
  },
};

// Initialize with proper UUID data
export const initializeSampleData = () => {
  // Only initialize if no data exists
  if (courseService.getAll().length === 0) {
        saveToStorage('matt_decanted_modules', []);
  }
};  