import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const db = Platform.OS === 'web' 
  ? { 
      execSync: () => {}, 
      runSync: () => ({ lastInsertRowId: 0, changes: 0 }),
      getAllSync: () => [],
      getFirstSync: () => null,
      withTransactionSync: (cb) => cb()
    } // Dummy for web
  : SQLite.openDatabaseSync('campus_room_manager.db');

export default db;
