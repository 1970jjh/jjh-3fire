// Firestore 데이터베이스 서비스
import { db, storage } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { SessionConfig, ReportData } from '../types';

// ============ 세션(방) 관리 ============

// 세션 생성
export const createSession = async (session: SessionConfig): Promise<string> => {
  const sessionsRef = collection(db, 'sessions');
  const docRef = await addDoc(sessionsRef, {
    ...session,
    createdAt: Timestamp.now()
  });
  return docRef.id;
};

// 세션 ID로 세션 생성 (특정 ID 지정)
export const createSessionWithId = async (session: SessionConfig): Promise<void> => {
  const sessionRef = doc(db, 'sessions', session.id);
  await setDoc(sessionRef, {
    ...session,
    createdAt: Timestamp.now()
  });
};

// 모든 세션 가져오기
export const getAllSessions = async (): Promise<SessionConfig[]> => {
  const sessionsRef = collection(db, 'sessions');
  const q = query(sessionsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toMillis() || Date.now()
  })) as SessionConfig[];
};

// 세션 실시간 구독
export const subscribeToSessions = (
  callback: (sessions: SessionConfig[]) => void
): Unsubscribe => {
  const sessionsRef = collection(db, 'sessions');
  const q = query(sessionsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toMillis() || Date.now()
    })) as SessionConfig[];
    callback(sessions);
  });
};

// 세션 업데이트
export const updateSession = async (sessionId: string, updates: Partial<SessionConfig>): Promise<void> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await updateDoc(sessionRef, updates);
};

// 세션 삭제
export const deleteSession = async (sessionId: string): Promise<void> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  await deleteDoc(sessionRef);

  // 해당 세션의 모든 보고서도 삭제
  const reportsRef = collection(db, 'reports');
  const q = query(reportsRef, where('sessionId', '==', sessionId));
  const snapshot = await getDocs(q);

  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// 세션 하나 가져오기
export const getSession = async (sessionId: string): Promise<SessionConfig | null> => {
  const sessionRef = doc(db, 'sessions', sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) return null;

  return {
    ...snapshot.data(),
    id: snapshot.id,
    createdAt: snapshot.data().createdAt?.toMillis() || Date.now()
  } as SessionConfig;
};

// ============ 보고서 관리 ============

// 보고서 제출/저장
export const submitReport = async (report: ReportData): Promise<string> => {
  const reportsRef = collection(db, 'reports');

  // 기존 보고서가 있는지 확인 (같은 세션, 같은 팀, 같은 사용자)
  const q = query(
    reportsRef,
    where('sessionId', '==', report.sessionId),
    where('teamId', '==', report.teamId),
    where('userName', '==', report.userName)
  );
  const existing = await getDocs(q);

  if (!existing.empty) {
    // 기존 보고서 업데이트
    const docRef = existing.docs[0].ref;
    await updateDoc(docRef, {
      ...report,
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } else {
    // 새 보고서 생성
    const docRef = await addDoc(reportsRef, {
      ...report,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// 세션의 모든 보고서 가져오기
export const getReportsBySession = async (sessionId: string): Promise<ReportData[]> => {
  const reportsRef = collection(db, 'reports');
  const q = query(
    reportsRef,
    where('sessionId', '==', sessionId),
    orderBy('teamId', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) as ReportData[];
};

// 세션 보고서 실시간 구독
export const subscribeToReports = (
  sessionId: string,
  callback: (reports: ReportData[]) => void
): Unsubscribe => {
  const reportsRef = collection(db, 'reports');
  const q = query(
    reportsRef,
    where('sessionId', '==', sessionId)
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as ReportData[];
    // 팀 번호순으로 정렬
    reports.sort((a, b) => a.teamId - b.teamId);
    callback(reports);
  });
};

// 특정 팀의 보고서 가져오기
export const getReportByTeam = async (
  sessionId: string,
  teamId: number
): Promise<ReportData | null> => {
  const reportsRef = collection(db, 'reports');
  const q = query(
    reportsRef,
    where('sessionId', '==', sessionId),
    where('teamId', '==', teamId)
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  return {
    ...snapshot.docs[0].data(),
    id: snapshot.docs[0].id
  } as ReportData;
};

// ============ 보고서 이미지(PNG) 관리 ============

// PNG 이미지 업로드 및 URL 반환
export const uploadReportImage = async (
  sessionId: string,
  teamId: number,
  userName: string,
  imageBlob: Blob
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `reports/${sessionId}/${teamId}조_${userName}_${timestamp}.png`;
  const storageRef = ref(storage, fileName);

  await uploadBytes(storageRef, imageBlob);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};

// 보고서에 이미지 URL 업데이트
export const updateReportImageUrl = async (
  reportId: string,
  imageUrl: string
): Promise<void> => {
  const reportRef = doc(db, 'reports', reportId);
  await updateDoc(reportRef, {
    reportImageUrl: imageUrl,
    updatedAt: Timestamp.now()
  });
};
