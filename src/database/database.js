import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = Platform.OS === 'web' 
  ? { transaction: () => ({ executeSql: () => {} }) } // Dummy for web
  : SQLite.openDatabase('campus_room_manager.db');

export default db;
