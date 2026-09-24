import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  Users, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Trophy, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Play,
  ArrowRight,
  Share2,
  MessageCircle,
  Link,
  History,
  Radio,
  ExternalLink,
  X,
  Globe,
  ChevronRight,
  RefreshCw,
  Eye,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  limit, 
  increment 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GlassCard } from './ui/GlassCard';
import { useArena } from '../context/ArenaContext';
import { Question, Subject, QuestionDifficulty, BattleSession, Branch, RecentOpponent, UserBattleRecord, BattleQuestionRecord } from '../types';
import { generateAIQuestions } from '../services/aiService';
import { AKTU_BRANCHES } from '../data/branches';
import { getSubjectsForBranch } from '../data/aktuCurriculum';
import { BattleHistoryList } from './BattleHistoryList';
import { BattleReviewModal } from './BattleReviewModal';

export const LiveBattle: React.FC = () => {
  const { 
    profile, 
    curriculum, 
    updateUserProfile, 
    recordQuestionAttempt,
    pendingBattleRoomId,
    setPendingBattleRoomId
  } = useArena();

  const userBranch = (profile?.branch as Branch) || 'CSE';
  const [battleBranch, setBattleBranch] = useState<Branch | 'All'>(userBranch);

  useEffect(() => {
    if (profile?.branch) {
      setBattleBranch(profile.branch);
    }
  }, [profile?.branch]);

  const availableSubjects = getSubjectsForBranch(battleBranch, curriculum);

  const [battleState, setBattleState] = useState<'lobby' | 'matchmaking' | 'versus' | 'active' | 'complete'>('lobby');
  const [battleMode, setBattleMode] = useState<'multiplayer' | 'solo'>('multiplayer');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('BAS103');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Medium');

  useEffect(() => {
    if (!availableSubjects.some((s) => s.subjectId === selectedSubjectId)) {
      if (availableSubjects.length > 0) {
        setSelectedSubjectId(availableSubjects[0].subjectId);
      }
    }
  }, [battleBranch, availableSubjects, selectedSubjectId]);

  // Multiplayer Firestore Room state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2'>('player1');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualRoomInput, setManualRoomInput] = useState('');

  // Live match details
  const [opponentUid, setOpponentUid] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState('Waiting for Peer...');
  const [opponentBranch, setOpponentBranch] = useState('AKTU');
  const [opponentCollege, setOpponentCollege] = useState('AKTU');
  const [battleQuestions, setBattleQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentCurrentQ, setOpponentCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Custom Room created in Lobby
  const [createdCustomRoom, setCreatedCustomRoom] = useState<{ id: string; subject: Subject } | null>(null);

  // Recent Opponents history
  const [recentOpponents, setRecentOpponents] = useState<RecentOpponent[]>([]);
  const [customChallengeOpponent, setCustomChallengeOpponent] = useState<RecentOpponent | null>(null);

  // Rematch subject picker on Complete Screen
  const [showRematchSubjectPicker, setShowRematchSubjectPicker] = useState(false);
  const [rematchSubjectId, setRematchSubjectId] = useState<string>('BAS103');
  const [rematchNotice, setRematchNotice] = useState<string | null>(null);

  // Sub-tabs in Lobby: Arena vs Battle History
  const [lobbyTab, setLobbyTab] = useState<'arena' | 'history'>('arena');

  // Track each question's answer in current battle for review & history
  const [userAnswers, setUserAnswers] = useState<{
    [qIndex: number]: {
      selectedOption: string | null;
      isCorrect: boolean;
      timeTaken: number;
    };
  }>({});

  // Finished battle record for immediate review
  const [lastFinishedRecord, setLastFinishedRecord] = useState<UserBattleRecord | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const selectedSubject = availableSubjects.find((s) => s.subjectId === selectedSubjectId) || availableSubjects[0] || curriculum[0];
  const roomUnsubRef = useRef<(() => void) | null>(null);

  // Load recent opponents from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aktu_recent_opponents');
      if (stored) {
        setRecentOpponents(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load recent opponents:', e);
    }
  }, []);

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (roomUnsubRef.current) {
        roomUnsubRef.current();
      }
    };
  }, []);

  // Check if URL query parameter provided a battle room to join immediately
  useEffect(() => {
    if (pendingBattleRoomId && profile && battleState === 'lobby') {
      const codeToJoin = pendingBattleRoomId;
      setPendingBattleRoomId(null);
      setManualRoomInput(codeToJoin);
      joinRoomByCode(codeToJoin);
    }
  }, [pendingBattleRoomId, profile, battleState]);

  // Timer for active battle
  useEffect(() => {
    if (battleState !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleNextQuestion(false);
          return 25;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [battleState, currentIndex, battleQuestions]);

  // Dynamic Real-time Opponent simulation pacer
  useEffect(() => {
    if (battleState !== 'active') return;

    // Simulate realistic opponent action pacing for current question (answers within 3.5 to 7.5 seconds)
    const delay = Math.floor(Math.random() * 3500) + 3200;
    const oppTimer = setTimeout(() => {
      setOpponentScore((prev) => {
        // Realistic 75% accuracy
        const isCorrect = Math.random() < 0.75;
        if (isCorrect) {
          const bonus = Math.floor(Math.random() * 60) + 40;
          return prev + 100 + bonus;
        }
        return prev;
      });
      setOpponentCurrentQ((prev) => Math.min(currentIndex + 1, battleQuestions.length));
    }, delay);

    return () => clearTimeout(oppTimer);
  }, [battleState, currentIndex, battleQuestions.length]);

  // Handle Solo Mode Start
  const startSoloBattle = async () => {
    setLoadingMatch(true);
    setBattleMode('solo');
    setBattleState('matchmaking');
    setOpponentUid(null);
    setUserAnswers({});
    setLastFinishedRecord(null);

    try {
      const qList = await generateAIQuestions({
        subject: selectedSubject.subjectName,
        subjectId: selectedSubject.subjectId,
        unit: 1,
        topic: selectedSubject.units[0]?.topics[0] || 'Core Principles',
        difficulty,
        questionCount: 5,
        questionType: 'MCQ',
        branch: profile?.branch || 'CSE',
        academicSession: '2026–27',
      });

      setBattleQuestions(qList);
      setLoadingMatch(false);

      setBattleState('active');
      setCurrentIndex(0);
      setPlayerScore(0);
      setOpponentScore(0);
      setTimeLeft(25);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } catch (err: any) {
      alert('Failed to generate solo questions: ' + err.message);
      setBattleState('lobby');
      setLoadingMatch(false);
    }
  };

  // Handle Multiplayer Matchmaking via Firestore
  const startMultiplayerMatchmaking = async () => {
    if (!profile) return;
    setLoadingMatch(true);
    setBattleMode('multiplayer');
    setBattleState('matchmaking');
    setUserAnswers({});
    setLastFinishedRecord(null);

    try {
      // 1. Search for existing waiting room in battles collection (cross-branch match on this subject)
      const roomsQuery = query(
        collection(db, 'battles'),
        where('status', '==', 'waiting'),
        where('subjectId', '==', selectedSubject.subjectId),
        limit(5)
      );

      const querySnapshot = await getDocs(roomsQuery);
      let foundRoomId: string | null = null;
      const now = Date.now();

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        let createdTime = 0;
        if (data.createdAt) {
          createdTime = new Date(data.createdAt).getTime();
        }
        // Only accept waiting rooms created in the last 45 seconds (strictly active live human users)
        const isFresh = createdTime > 0 ? (now - createdTime) < 45000 : false;

        if (data.player1?.uid !== profile.uid && isFresh) {
          foundRoomId = docSnap.id;
          if (data.player1) {
            setOpponentUid(data.player1.uid || null);
            setOpponentName(data.player1.displayName || 'Live Peer');
            setOpponentBranch(data.player1.branch || 'AKTU');
          }
          break;
        }
      }

      if (foundRoomId) {
        // Join existing room as player2
        setPlayerRole('player2');
        setActiveRoomId(foundRoomId);

        const roomRef = doc(db, 'battles', foundRoomId);
        await updateDoc(roomRef, {
          status: 'active',
          'player2.uid': profile.uid,
          'player2.displayName': profile.displayName || 'Engineer',
          'player2.branch': `${profile.branch} (${profile.collegeName || profile.university || 'AKTU'})`,
          'player2.score': 0,
          'player2.currentQuestionIndex': 0,
          'player2.isFinished': false,
        });

        listenToRoom(foundRoomId, 'player2');
      } else {
        // Create new waiting room as player1
        setPlayerRole('player1');
        const qList = await generateAIQuestions({
          subject: selectedSubject.subjectName,
          subjectId: selectedSubject.subjectId,
          unit: 1,
          topic: selectedSubject.units[0]?.topics[0] || 'Core Principles',
          difficulty,
          questionCount: 5,
          questionType: 'MCQ',
          branch: profile?.branch || 'CSE',
          academicSession: '2026–27',
        });

        const newRoomRef = await addDoc(collection(db, 'battles'), {
          subjectId: selectedSubject.subjectId,
          subjectName: selectedSubject.subjectName,
          topic: selectedSubject.units[0]?.topics[0] || 'Core Principles',
          difficulty,
          questionCount: 5,
          status: 'waiting',
          player1: {
            uid: profile.uid,
            displayName: profile.displayName || 'Engineer',
            branch: `${profile.branch} (${profile.collegeName || profile.university || 'AKTU'})`,
            score: 0,
            currentQuestionIndex: 0,
            isFinished: false,
          },
          player2: null,
          questions: qList,
          createdAt: new Date().toISOString(),
        });

        setActiveRoomId(newRoomRef.id);
        setBattleQuestions(qList);
        listenToRoom(newRoomRef.id, 'player1');
      }
    } catch (err: any) {
      console.error('Matchmaking error:', err);
      alert('Connecting to solo practice mode due to network: ' + (err.message || ''));
      startSoloBattle();
    } finally {
      setLoadingMatch(false);
    }
  };

  // Create a Custom Private Room directly in the Lobby
  const handleCreateCustomRoom = async () => {
    if (!profile) return;
    setLoadingMatch(true);
    setUserAnswers({});
    setLastFinishedRecord(null);

    try {
      const qList = await generateAIQuestions({
        subject: selectedSubject.subjectName,
        subjectId: selectedSubject.subjectId,
        unit: 1,
        topic: selectedSubject.units[0]?.topics[0] || 'Core Principles',
        difficulty,
        questionCount: 5,
        questionType: 'MCQ',
        branch: profile.branch || 'CSE',
        academicSession: '2026–27',
      });

      const newRoomRef = await addDoc(collection(db, 'battles'), {
        subjectId: selectedSubject.subjectId,
        subjectName: selectedSubject.subjectName,
        topic: selectedSubject.units[0]?.topics[0] || 'Core Principles',
        difficulty,
        questionCount: 5,
        status: 'waiting',
        player1: {
          uid: profile.uid,
          displayName: profile.displayName || 'Engineer',
          branch: `${profile.branch} (${profile.collegeName || profile.university || 'AKTU'})`,
          score: 0,
          currentQuestionIndex: 0,
          isFinished: false,
        },
        player2: null,
        questions: qList,
        createdAt: new Date().toISOString(),
      });

      setCreatedCustomRoom({ id: newRoomRef.id, subject: selectedSubject });
      setActiveRoomId(newRoomRef.id);
      setPlayerRole('player1');
      setBattleQuestions(qList);
      setBattleMode('multiplayer');

      listenToRoom(newRoomRef.id, 'player1');
    } catch (err: any) {
      alert('Failed to create custom battle room: ' + err.message);
    } finally {
      setLoadingMatch(false);
    }
  };

  const handleCancelCustomRoom = async () => {
    if (roomUnsubRef.current) roomUnsubRef.current();
    if (activeRoomId) {
      try {
        await updateDoc(doc(db, 'battles', activeRoomId), { status: 'cancelled' }).catch(() => {});
        await deleteDoc(doc(db, 'battles', activeRoomId)).catch(() => {});
      } catch (e) {
        console.warn('Failed to delete cancelled room:', e);
      }
    }
    setPendingBattleRoomId(null);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
    setCreatedCustomRoom(null);
    setActiveRoomId(null);
    setBattleState('lobby');
    setLoadingMatch(false);
  };

  // Join match by manual room code or URL
  const joinRoomByCode = async (code: string) => {
    if (!profile || !code.trim()) return;
    setLoadingMatch(true);
    setBattleMode('multiplayer');

    try {
      let cleanCode = code.trim();
      // Handle potential full URLs or queries pasted in (e.g. ?room=ROOM_ID or https://.../?room=ROOM_ID)
      if (cleanCode.includes('?') || cleanCode.includes('/') || cleanCode.includes('=')) {
        try {
          const dummyBase = cleanCode.startsWith('http') 
            ? cleanCode 
            : `https://aktu.edu/${cleanCode.startsWith('?') ? cleanCode : `?${cleanCode}`}`;
          const urlObj = new URL(dummyBase);
          const p = urlObj.searchParams.get('room') || urlObj.searchParams.get('battle') || urlObj.searchParams.get('battleRoom') || urlObj.searchParams.get('join');
          if (p) {
            cleanCode = p.trim();
          } else {
            const parts = urlObj.pathname.split('/').filter(Boolean);
            if (parts.length > 0 && parts[parts.length - 1].length >= 4) {
              cleanCode = parts[parts.length - 1].trim();
            }
          }
        } catch (e) {
          // ignore error, fall back to code directly
        }
      }

      setBattleState('matchmaking');
      const roomRef = doc(db, 'battles', cleanCode);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        alert(`Battle room "${cleanCode}" does not exist or was cancelled by the host.`);
        setPendingBattleRoomId(null);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
        setBattleState('lobby');
        setLoadingMatch(false);
        return;
      }

      const rData = roomSnap.data();

      // If room was cancelled
      if (rData.status === 'cancelled') {
        alert(`Battle room "${cleanCode}" has been cancelled by the host.`);
        setPendingBattleRoomId(null);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
        setBattleState('lobby');
        setLoadingMatch(false);
        return;
      }

      // If already completed
      if (rData.status === 'completed') {
        alert('This battle room has already finished.');
        setPendingBattleRoomId(null);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
        setBattleState('lobby');
        setLoadingMatch(false);
        return;
      }

      // If user is already Player 1 (the host reconnecting)
      if (rData.player1?.uid === profile.uid) {
        setPlayerRole('player1');
        setActiveRoomId(cleanCode);
        if (rData.questions && rData.questions.length > 0) {
          setBattleQuestions(rData.questions);
        }
        if (rData.player2) {
          setOpponentUid(rData.player2.uid || null);
          setOpponentName(rData.player2.displayName || 'Live Peer');
          setOpponentBranch(rData.player2.branch || 'AKTU');
        }
        listenToRoom(cleanCode, 'player1');
        setBattleState(rData.status === 'active' ? 'active' : 'matchmaking');
        setLoadingMatch(false);
        return;
      }

      // If user is already Player 2 reconnecting
      if (rData.player2?.uid === profile.uid) {
        setPlayerRole('player2');
        setActiveRoomId(cleanCode);
        if (rData.questions && rData.questions.length > 0) {
          setBattleQuestions(rData.questions);
        }
        if (rData.player1) {
          setOpponentUid(rData.player1.uid || null);
          setOpponentName(rData.player1.displayName || 'Room Host');
          setOpponentBranch(rData.player1.branch || 'AKTU');
        }
        listenToRoom(cleanCode, 'player2');
        setBattleState(rData.status === 'active' ? 'active' : 'matchmaking');
        setLoadingMatch(false);
        return;
      }

      // If room is already full with another opponent
      if (rData.status === 'active' && rData.player2) {
        alert('This battle room is already full (both players connected).');
        setPendingBattleRoomId(null);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
        setBattleState('lobby');
        setLoadingMatch(false);
        return;
      }

      // Join room as Player 2
      if (rData.player1) {
        setOpponentUid(rData.player1.uid || null);
        setOpponentName(rData.player1.displayName || 'Room Host');
        setOpponentBranch(rData.player1.branch || 'AKTU');
      }
      if (rData.questions && rData.questions.length > 0) {
        setBattleQuestions(rData.questions);
      }

      setPlayerRole('player2');
      setActiveRoomId(cleanCode);

      await updateDoc(roomRef, {
        status: 'active',
        'player2.uid': profile.uid,
        'player2.displayName': profile.displayName || 'Engineer',
        'player2.branch': `${profile.branch || 'CSE'} (${profile.collegeName || profile.university || 'AKTU'})`,
        'player2.score': 0,
        'player2.currentQuestionIndex': 0,
        'player2.isFinished': false,
      });

      listenToRoom(cleanCode, 'player2');
    } catch (err: any) {
      alert('Could not join battle room: ' + err.message);
      setBattleState('lobby');
    } finally {
      setLoadingMatch(false);
    }
  };

  // Live Firestore Room Listener
  const listenToRoom = (roomId: string, role: 'player1' | 'player2') => {
    if (roomUnsubRef.current) roomUnsubRef.current();

    const unsub = onSnapshot(doc(db, 'battles', roomId), (docSnap) => {
      if (!docSnap.exists() || docSnap.data()?.status === 'cancelled') {
        setBattleState((prev) => {
          if (prev === 'matchmaking' || prev === 'versus') {
            alert('The battle room was cancelled or closed by the host.');
            setActiveRoomId(null);
            setPendingBattleRoomId(null);
            try {
              window.history.replaceState({}, document.title, window.location.pathname);
            } catch (e) {}
            return 'lobby';
          }
          return prev;
        });
        return;
      }
      const data = docSnap.data();

      if (data.questions && data.questions.length > 0) {
        setBattleQuestions(data.questions);
      }

      // Sync opponent info
      const opp = role === 'player1' ? data.player2 : data.player1;
      if (opp) {
        setOpponentUid(opp.uid || null);
        setOpponentName(opp.displayName || 'Live Peer');
        setOpponentBranch(opp.branch || 'AKTU');
        setOpponentScore(opp.score || 0);
        setOpponentCurrentQ(opp.currentQuestionIndex || 0);
      }

      // If status changed to active and we are in lobby or matchmaking, transition to versus
      if (data.status === 'active' && data.player2) {
        setCreatedCustomRoom(null);
        setBattleState((prev) => {
          if (prev === 'matchmaking' || prev === 'lobby') {
            setTimeout(() => {
              setBattleState('active');
              setCurrentIndex(0);
              setPlayerScore(0);
              setTimeLeft(25);
              setSelectedOption(null);
              setIsAnswerChecked(false);
            }, 2000);
            return 'versus';
          }
          return prev;
        });
      }
    });

    roomUnsubRef.current = unsub;
  };

  // Option selection
  const handleSelectOption = async (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
    setIsAnswerChecked(true);

    const currentQ = battleQuestions[currentIndex];
    const isCorrect = opt === currentQ.correctAnswer;
    let newScore = playerScore;

    if (isCorrect) {
      const bonus = Math.max(timeLeft * 4, 10);
      newScore = playerScore + 100 + bonus;
      setPlayerScore(newScore);
    }

    // Record user's choice in userAnswers for detailed question review
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selectedOption: opt,
        isCorrect,
        timeTaken: Math.max(25 - timeLeft, 1),
      },
    }));

    // Record attempt locally & in Firestore attempts collection
    recordQuestionAttempt(
      selectedSubject.subjectId,
      isCorrect,
      isCorrect ? 30 : 5,
      currentQ.topic || 'Battle Duel',
      currentQ.question
    );

    // Sync score to Firestore room if in multiplayer
    if (battleMode === 'multiplayer' && activeRoomId) {
      try {
        const roomRef = doc(db, 'battles', activeRoomId);
        const scoreKey = playerRole === 'player1' ? 'player1.score' : 'player2.score';
        const indexKey = playerRole === 'player1' ? 'player1.currentQuestionIndex' : 'player2.currentQuestionIndex';
        await updateDoc(roomRef, {
          [scoreKey]: newScore,
          [indexKey]: currentIndex + 1,
        });
      } catch (err) {
        console.warn('Firestore room update warning:', err);
      }
    }
  };

  const handleNextQuestion = (userTriggered = true) => {
    // If user timed out without selecting an answer, record it as missed
    if (!userTriggered && !isAnswerChecked) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentIndex]: prev[currentIndex] || {
          selectedOption: null,
          isCorrect: false,
          timeTaken: 25,
        },
      }));
    }

    if (currentIndex < battleQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setTimeLeft(25);

      if (battleMode === 'multiplayer' && activeRoomId) {
        const indexKey = playerRole === 'player1' ? 'player1.currentQuestionIndex' : 'player2.currentQuestionIndex';
        updateDoc(doc(db, 'battles', activeRoomId), {
          [indexKey]: nextIdx,
        }).catch(() => {});
      }
    } else {
      finishBattle();
    }
  };

  const finishBattle = async () => {
    setBattleState('complete');
    const isWinner = battleMode === 'solo' ? playerScore >= 300 : playerScore >= opponentScore;

    if (isWinner) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    // Build the complete question review array with all questions & answers
    const questionRecords: BattleQuestionRecord[] = battleQuestions.map((q, idx) => {
      const ans = userAnswers[idx];
      return {
        questionId: q.id || `q_${idx}`,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'According to the official AKTU university syllabus and curriculum guidelines, this question evaluates core semester principles.',
        selectedOption: ans?.selectedOption ?? null,
        isCorrect: !!ans?.isCorrect,
        timeTakenSeconds: ans?.timeTaken ?? 25,
      };
    });

    const gainedXP = isWinner ? 150 : 50;
    const battleResult = isWinner ? 'won' : (battleMode === 'multiplayer' && playerScore === opponentScore ? 'tied' : 'lost');

    const battleRecord: UserBattleRecord = {
      id: `${profile?.uid || 'user'}_${Date.now()}`,
      battleId: activeRoomId || `duel_${Date.now()}`,
      userId: profile?.uid || 'anon',
      mode: battleMode,
      subjectId: selectedSubject.subjectId,
      subjectName: selectedSubject.subjectName,
      topic: battleQuestions[0]?.topic || 'Engineering Core',
      difficulty,
      myScore: playerScore,
      opponentScore: battleMode === 'multiplayer' ? opponentScore : undefined,
      opponentUid: battleMode === 'multiplayer' ? (opponentUid || undefined) : undefined,
      opponentName: battleMode === 'multiplayer' ? (opponentName || 'AKTU Peer') : undefined,
      opponentBranch: battleMode === 'multiplayer' ? (opponentBranch || undefined) : undefined,
      opponentCollege: battleMode === 'multiplayer' ? (opponentCollege || undefined) : undefined,
      result: battleResult,
      xpEarned: gainedXP,
      questions: questionRecords,
      createdAt: new Date().toISOString(),
    };

    setLastFinishedRecord(battleRecord);

    // Save directly to Firestore collection user_battle_history
    if (profile?.uid) {
      try {
        await addDoc(collection(db, 'user_battle_history'), battleRecord);
        const cacheKey = `aktu_battle_history_${profile.uid}`;
        const existingRaw = localStorage.getItem(cacheKey);
        const existing: UserBattleRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
        const updated = [battleRecord, ...existing.filter(b => b.battleId !== battleRecord.battleId)].slice(0, 30);
        localStorage.setItem(cacheKey, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not persist battle record to Firestore:', err);
      }
    }

    // Update student statistics
    if (profile) {
      const newBattlesPlayed = (profile.battlesPlayed || 0) + 1;
      const newBattlesWon = (profile.battlesWon || 0) + (isWinner ? 1 : 0);
      const newBattlesLost = (profile.battlesLost || 0) + (isWinner ? 0 : 1);

      await updateUserProfile({
        battlesPlayed: newBattlesPlayed,
        battlesWon: newBattlesWon,
        battlesLost: newBattlesLost,
        xp: (profile.xp || 0) + gainedXP,
      });
    }

    if (battleMode === 'multiplayer' && activeRoomId) {
      const finishedKey = playerRole === 'player1' ? 'player1.isFinished' : 'player2.isFinished';
      updateDoc(doc(db, 'battles', activeRoomId), {
        [finishedKey]: true,
        status: 'completed',
      }).catch(() => {});
    }

    // Save opponent to Recent Opponents
    if (battleMode === 'multiplayer' && opponentUid && opponentName !== 'Waiting for Peer...' && opponentName !== 'Live Peer') {
      const newRecent: RecentOpponent = {
        opponentUid,
        opponentName,
        opponentBranch,
        opponentCollege,
        lastSubjectId: selectedSubject.subjectId,
        lastSubjectName: selectedSubject.subjectName,
        lastTopic: battleQuestions[0]?.topic || 'Engineering Core',
        myScore: playerScore,
        opponentScore: opponentScore,
        result: playerScore > opponentScore ? 'won' : playerScore < opponentScore ? 'lost' : 'tied',
        timestamp: new Date().toISOString(),
      };

      try {
        const existingRaw = localStorage.getItem('aktu_recent_opponents');
        const existing: RecentOpponent[] = existingRaw ? JSON.parse(existingRaw) : [];
        const filtered = existing.filter((item) => item.opponentUid !== opponentUid);
        const updated = [newRecent, ...filtered].slice(0, 8);
        localStorage.setItem('aktu_recent_opponents', JSON.stringify(updated));
        setRecentOpponents(updated);
      } catch (e) {
        console.warn('Failed to cache recent opponent:', e);
      }
    }
  };

  // Send an instant challenge to a recent opponent or for rematch
  const sendInstantChallenge = async (
    targetOpponentUid: string,
    targetOpponentName: string,
    targetSubject: Subject
  ) => {
    if (!profile) return;
    setLoadingMatch(true);
    setRematchNotice(`Sending challenge to ${targetOpponentName}...`);

    try {
      const qList = await generateAIQuestions({
        subject: targetSubject.subjectName,
        subjectId: targetSubject.subjectId,
        unit: 1,
        topic: targetSubject.units[0]?.topics[0] || 'Core Principles',
        difficulty,
        questionCount: 5,
        questionType: 'MCQ',
        branch: profile.branch || 'CSE',
        academicSession: '2026–27',
      });

      const newRoomRef = await addDoc(collection(db, 'battles'), {
        subjectId: targetSubject.subjectId,
        subjectName: targetSubject.subjectName,
        topic: targetSubject.units[0]?.topics[0] || 'Core Principles',
        difficulty,
        questionCount: 5,
        status: 'waiting',
        player1: {
          uid: profile.uid,
          displayName: profile.displayName || 'Engineer',
          branch: `${profile.branch} (${profile.collegeName || profile.university || 'AKTU'})`,
          score: 0,
          currentQuestionIndex: 0,
          isFinished: false,
        },
        player2: null,
        questions: qList,
        createdAt: new Date().toISOString(),
      });

      // Write real-time challenge notification targeting the opponent
      await addDoc(collection(db, 'notifications'), {
        userId: targetOpponentUid,
        fromUserId: profile.uid,
        fromUserName: profile.displayName || 'AKTU Peer',
        fromUserBranch: profile.branch || 'Engineering',
        fromUserCollege: profile.collegeName || profile.university || 'AKTU',
        type: 'battle_challenge',
        title: `Live Duel Challenge`,
        message: `${profile.displayName} challenged you to a 5-round battle in ${targetSubject.subjectName}!`,
        read: false,
        status: 'pending',
        battleId: newRoomRef.id,
        subjectId: targetSubject.subjectId,
        subjectName: targetSubject.subjectName,
        difficulty,
        actionTab: 'battle',
        createdAt: new Date().toISOString(),
      });

      setActiveRoomId(newRoomRef.id);
      setPlayerRole('player1');
      setBattleQuestions(qList);
      setBattleMode('multiplayer');
      setOpponentUid(targetOpponentUid);
      setOpponentName(targetOpponentName);
      setBattleState('matchmaking');
      setRematchNotice(null);

      listenToRoom(newRoomRef.id, 'player1');
    } catch (err: any) {
      alert('Failed to send challenge: ' + err.message);
      setRematchNotice(null);
    } finally {
      setLoadingMatch(false);
    }
  };

  // Helper for generating invite URL
  const getInviteUrl = (roomId: string) => {
    return `${window.location.origin}${window.location.pathname}?room=${roomId}`;
  };

  const copyText = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareToWhatsApp = (roomId: string, subjName: string, subjCode: string) => {
    const url = getInviteUrl(roomId);
    const text = `*AKTU Arena 1v1 Battle Challenge*\nI have created a private battle room for *${subjName}* (${subjCode}).\n\nRoom Code: *${roomId}*\nJoin link:\n${url}\n\nLet's test who knows AKTU syllabus best!`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const shareNative = async (roomId: string, subjName: string, subjCode: string) => {
    const url = getInviteUrl(roomId);
    const text = `Join my AKTU Arena Live Battle in ${subjName}! Room Code: ${roomId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AKTU Arena Live Battle',
          text,
          url,
        });
        return;
      } catch (e) {
        // user cancel
      }
    }
    copyText(url, 'link');
  };

  const handlePasteRoomCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        // Extract room query parameter if pasted full URL
        try {
          const url = new URL(text);
          const rParam = url.searchParams.get('room') || url.searchParams.get('battle');
          if (rParam) {
            setManualRoomInput(rParam);
            return;
          }
        } catch {
          // not a URL, paste directly
        }
        setManualRoomInput(text.trim());
      }
    } catch {
      // clipboard permission denied
    }
  };

  const cancelSearch = async () => {
    if (roomUnsubRef.current) roomUnsubRef.current();
    if (activeRoomId && playerRole === 'player1') {
      try {
        await updateDoc(doc(db, 'battles', activeRoomId), { status: 'cancelled' }).catch(() => {});
        await deleteDoc(doc(db, 'battles', activeRoomId)).catch(() => {});
      } catch (e) {
        console.warn('Failed to clean up room on cancelSearch:', e);
      }
    }
    setPendingBattleRoomId(null);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {}
    setBattleState('lobby');
    setActiveRoomId(null);
    setCreatedCustomRoom(null);
    setLoadingMatch(false);
  };

  // 1. Lobby View
  if (battleState === 'lobby') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-2">
              <Swords className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time AKTU Arena Multiplayer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-['Outfit']">
              Live Battle Arena
            </h1>
          </div>

          {/* Sub-Tabs: Arena vs Match History */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
            <button
              onClick={() => setLobbyTab('arena')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                lobbyTab === 'arena'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Matchmaking & Rooms</span>
            </button>
            <button
              onClick={() => setLobbyTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                lobbyTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Battle History & Review</span>
            </button>
          </div>
        </div>

        {lobbyTab === 'history' ? (
          <GlassCard className="p-6" glow="cyan">
            <BattleHistoryList />
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Battle Config Card */}
          <GlassCard className="p-6 lg:col-span-2 space-y-6" glow="violet">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-1">
                Configure Battle Domain
              </h3>
              <p className="text-xs text-slate-400">
                Select your engineering domain and subject. Common subjects allow real-time battles across different branches!
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase flex items-center justify-between">
                    <span>Engineering Branch</span>
                    {battleBranch !== 'All' && (
                      <span className="text-[10px] text-cyan-400 font-normal">Active Profile</span>
                    )}
                  </label>
                  <select
                    value={battleBranch}
                    onChange={(e) => setBattleBranch(e.target.value as Branch | 'All')}
                    className="w-full bg-slate-950 border border-violet-500/30 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-400"
                  >
                    <option value="All">All AKTU Branches — Shared Subjects</option>
                    {AKTU_BRANCHES.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.shortName} — {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase flex items-center justify-between">
                    <span>Subject Domain ({availableSubjects.length})</span>
                    {selectedSubject.applicableBranches && selectedSubject.applicableBranches.length > 1 && (
                      <span className="text-[10px] text-emerald-400 font-normal">Cross-Branch</span>
                    )}
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-violet-500/30 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-400"
                  >
                    {availableSubjects.map((subj) => (
                      <option key={subj.subjectId} value={subj.subjectId}>
                        {subj.code} — {subj.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cross-branch badge banner */}
              {selectedSubject.applicableBranches && selectedSubject.applicableBranches.length > 1 && (
                <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Multi-Branch Subject:</strong> AKTU students from CSE, ECE, Mechanical, Civil, EE, and IT studying {selectedSubject.code} can all join and battle in this room!
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        difficulty === d
                          ? 'border-violet-500 bg-violet-950/40 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                          : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matchmaking Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={startMultiplayerMatchmaking}
                  disabled={loadingMatch}
                  className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 hover:from-violet-300 hover:to-cyan-300 shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  <span>Enter Live 1v1 Matchmaking</span>
                </button>

                <button
                  onClick={startSoloBattle}
                  disabled={loadingMatch}
                  className="w-full py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Timed Speed Duel (Solo)</span>
                </button>
              </div>

              {/* Create Custom Room & Social Share Section - Directly Below Matchmaking Button */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Create Custom Battle Room & Social Share
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Create a private room for {selectedSubject.subjectName} and invite friends via WhatsApp, Telegram, or code.
                    </p>
                  </div>
                </div>

                {!createdCustomRoom ? (
                  <button
                    onClick={handleCreateCustomRoom}
                    disabled={loadingMatch}
                    className="w-full py-3 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-violet-950/40 to-slate-950 hover:border-cyan-400/70 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                  >
                    <Swords className="w-4 h-4 text-cyan-400" />
                    <span>Create Custom Room & Generate Share Invite</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-3 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          Room Active • Waiting for Opponent
                        </span>
                      </div>
                      <button
                        onClick={handleCancelCustomRoom}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Cancel Room
                      </button>
                    </div>

                    {/* Room Code */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Room Code</div>
                        <div className="text-sm font-extrabold text-cyan-300 font-mono tracking-wider select-all">
                          {createdCustomRoom.id}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(createdCustomRoom.id, 'code')}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 hover:bg-cyan-900/50 text-xs font-bold text-cyan-300 flex items-center gap-1.5 transition-all"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>

                    {/* Direct Invite URL */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="truncate max-w-[200px] sm:max-w-[320px]">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Direct Share URL</div>
                        <div className="text-xs text-slate-300 font-mono truncate">
                          {getInviteUrl(createdCustomRoom.id)}
                        </div>
                      </div>
                      <button
                        onClick={() => copyText(getInviteUrl(createdCustomRoom.id), 'link')}
                        className="px-3 py-1.5 rounded-lg bg-violet-950 border border-violet-500/40 hover:bg-violet-900/50 text-xs font-bold text-violet-300 flex items-center gap-1.5 transition-all shrink-0"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                      </button>
                    </div>

                    {/* Social Share Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => shareToWhatsApp(createdCustomRoom.id, selectedSubject.subjectName, selectedSubject.code)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Share on WhatsApp</span>
                      </button>
                      <button
                        onClick={() => shareNative(createdCustomRoom.id, selectedSubject.subjectName, selectedSubject.code)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                      >
                        <Share2 className="w-4 h-4 text-cyan-400" />
                        <span>Share via Device / App</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Room Code Join */}
              <div className="pt-4 border-t border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                  Join Peer via Room Code or Paste Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualRoomInput}
                    onChange={(e) => setManualRoomInput(e.target.value)}
                    placeholder="Enter Room ID or paste invite URL..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    onClick={handlePasteRoomCode}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-all"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>
                  <button
                    onClick={() => joinRoomByCode(manualRoomInput)}
                    disabled={!manualRoomInput.trim() || loadingMatch}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Right Column: Battle Record Card & Quick Stats */}
          <div className="space-y-6">
            <GlassCard className="p-6" glow="none">
              <h3 className="text-base font-bold text-slate-100 font-['Outfit'] mb-4">
                Your Battle Card
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Total Battles</span>
                  <span className="text-sm font-bold text-slate-200">
                    {profile?.battlesPlayed || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Victories</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {profile?.battlesWon || 0} Wins
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs text-slate-400">Win Rate</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {profile?.battlesPlayed
                      ? Math.round(((profile.battlesWon || 0) / profile.battlesPlayed) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Arena Rating</span>
                  <span className="text-xs font-bold text-violet-400 px-2 py-0.5 rounded bg-violet-950/60 border border-violet-500/30">
                    {profile?.level ? `Tier ${profile.level} Engineer` : 'Cadet'}
                  </span>
                </div>
              </div>
            </GlassCard>

            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2">
              <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>AKTU Multi-Branch Duels</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                When you create a room in common first-year subjects (Maths, Physics, PPS, Electrical), any AKTU student can join your room directly via link or code!
              </p>
            </div>
          </div>
        </div>

        {/* Recent Battles & Rematches Section */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                <History className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Recent Battle Opponents & Rematch</h3>
                <p className="text-xs text-slate-400">Challenge recent peers immediately or pick a different AKTU subject</p>
              </div>
            </div>
            {recentOpponents.length > 0 && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {recentOpponents.length} {recentOpponents.length === 1 ? 'Peer' : 'Peers'}
              </span>
            )}
          </div>

          {recentOpponents.length === 0 ? (
            <div className="py-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80">
              <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-400">No Recent Multiplayer Battles Yet</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Enter matchmaking or create a private room above to battle fellow AKTU engineers.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOpponents.map((opp) => (
                <div
                  key={`${opp.opponentUid}-${opp.timestamp}`}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      opp.result === 'won'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : opp.result === 'lost'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {opp.result === 'won' ? 'WIN' : opp.result === 'lost' ? 'LOSS' : 'TIE'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{opp.opponentName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                          {opp.opponentBranch}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-cyan-400">{opp.lastSubjectName}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{opp.myScore} vs {opp.opponentScore} pts</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Quick Challenge Same Subject */}
                    <button
                      onClick={() => {
                        const targetSubj = availableSubjects.find(s => s.subjectId === opp.lastSubjectId) || curriculum.find(s => s.subjectId === opp.lastSubjectId) || selectedSubject;
                        sendInstantChallenge(opp.opponentUid, opp.opponentName, targetSubj);
                      }}
                      disabled={loadingMatch}
                      className="px-3 py-1.5 rounded-lg bg-violet-950 hover:bg-violet-900 border border-violet-500/40 text-[11px] font-bold text-violet-300 hover:text-white transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    >
                      <Swords className="w-3 h-3 text-cyan-400" />
                      <span>Rematch ({opp.lastSubjectId})</span>
                    </button>

                    {/* Challenge Any Subject (opens modal) */}
                    <button
                      onClick={() => setCustomChallengeOpponent(opp)}
                      disabled={loadingMatch}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 hover:text-white transition-all"
                    >
                      Other Subject...
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Custom Subject Challenge Modal */}
        {customChallengeOpponent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-slate-900 border border-violet-500/40 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-slate-100">
                    Challenge {customChallengeOpponent.opponentName}
                  </h3>
                </div>
                <button
                  onClick={() => setCustomChallengeOpponent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Select any AKTU curriculum subject to challenge this peer. An instant challenge popup will show on their screen!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
                    Select Subject
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.code} — {s.subjectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setCustomChallengeOpponent(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const opp = customChallengeOpponent;
                      setCustomChallengeOpponent(null);
                      sendInstantChallenge(opp.opponentUid, opp.opponentName, selectedSubject);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-xs font-bold text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  >
                    Send Challenge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
  }

  // 2. Matchmaking State
  if (battleState === 'matchmaking') {
    return (
      <div className="py-20 max-w-lg mx-auto text-center">
        <GlassCard className="p-8" glow="violet">
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
              <Swords className="w-7 h-7 text-slate-950" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-['Outfit']">
            {opponentUid ? `Waiting for ${opponentName} to Accept...` : battleMode === 'multiplayer' ? 'Waiting for Opponent...' : 'Preparing Speed Duel...'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            {opponentUid 
              ? `Challenge notification dispatched to ${opponentName}. When they tap Accept, the battle will start immediately.`
              : battleMode === 'multiplayer'
              ? `Searching for peers in ${selectedSubject.code}. Share your room code or direct link to invite anyone.`
              : 'Generating curriculum-verified AKTU questions for your timed sprint.'}
          </p>

          {activeRoomId && battleMode === 'multiplayer' && (
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="text-[11px] text-slate-400 font-medium">
                Room Code & Direct Share Options:
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xs text-cyan-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 select-all">
                  {activeRoomId}
                </span>
                <button
                  onClick={() => copyText(activeRoomId, 'code')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Copy Room ID"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Quick WhatsApp Share from waiting screen */}
              <button
                onClick={() => shareToWhatsApp(activeRoomId, selectedSubject.subjectName, selectedSubject.code)}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Share Code on WhatsApp</span>
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={cancelSearch}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800"
            >
              Cancel Matchmaking
            </button>
            {battleMode === 'multiplayer' && (
              <button
                onClick={startSoloBattle}
                className="px-5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/40"
              >
                Switch to Solo Duel
              </button>
            )}
          </div>
        </GlassCard>
      </div>
    );
  }

  // 3. Versus Animation
  if (battleState === 'versus') {
    return (
      <div className="py-16 max-w-2xl mx-auto">
        <GlassCard className="p-8 text-center" glow="cyan">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">
            LIVE OPPONENT CONNECTED
          </div>

          <div className="grid grid-cols-3 items-center gap-4">
            <div className="space-y-1">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xl font-bold">
                {profile?.displayName?.[0] || 'U'}
              </div>
              <div className="text-sm font-bold text-slate-100 mt-2 truncate">
                {profile?.displayName || 'You'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {profile?.branch || 'CSE'} ({profile?.collegeName || profile?.university || 'AKTU'})
              </div>
            </div>

            <div className="text-3xl font-extrabold text-violet-400 font-['Outfit'] italic animate-pulse">
              VS
            </div>

            <div className="space-y-1">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 text-xl font-bold">
                {opponentName[0] || 'P'}
              </div>
              <div className="text-sm font-bold text-slate-100 mt-2 truncate">
                {opponentName}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {opponentBranch}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // 4. Complete Battle Screen
  if (battleState === 'complete') {
    const isWinner = battleMode === 'solo' ? playerScore >= 300 : playerScore >= opponentScore;

    return (
      <div className="py-12 max-w-lg mx-auto text-center">
        <GlassCard className="p-8" glow={isWinner ? 'cyan' : 'none'}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-4">
            <Trophy className={`w-8 h-8 ${isWinner ? 'text-amber-400' : 'text-slate-400'}`} />
          </div>

          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
            BATTLE FINISHED
          </div>
          <h2 className="text-3xl font-extrabold text-slate-100 font-['Outfit']">
            {isWinner ? 'VICTORY ACHIEVED!' : 'BATTLE CONCLUDED'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            {isWinner 
              ? '+150 XP awarded directly to your verified AKTU student profile.' 
              : '+50 XP awarded for participating in live arena duel.'}
          </p>

          <div className={`grid ${battleMode === 'multiplayer' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 mb-6`}>
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
              <div className="text-xs text-slate-400">Your Final Score</div>
              <div className="text-2xl font-bold text-cyan-300 mt-0.5">
                {playerScore} pts
              </div>
            </div>
            {battleMode === 'multiplayer' && (
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30">
                <div className="text-xs text-slate-400 truncate">{opponentName} Score</div>
                <div className="text-2xl font-bold text-violet-300 mt-0.5">
                  {opponentScore} pts
                </div>
              </div>
            )}
          </div>

          {/* Rematch Section Against Same Opponent */}
          {battleMode === 'multiplayer' && opponentUid && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/30 space-y-3 mb-6 text-left">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-cyan-400" />
                  Instant Rematch with {opponentName}
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">{opponentBranch}</span>
              </div>

              <p className="text-[11px] text-slate-400">
                Challenge {opponentName} right now. An instant invitation popup will appear immediately on their screen to join or decline!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => sendInstantChallenge(opponentUid, opponentName, selectedSubject)}
                  disabled={loadingMatch}
                  className="py-2.5 px-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-violet-400 hover:from-cyan-300 hover:to-violet-300 text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rematch (Same Subject)</span>
                </button>

                <button
                  onClick={() => setShowRematchSubjectPicker(!showRematchSubjectPicker)}
                  disabled={loadingMatch}
                  className="py-2.5 px-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Challenge in Other Subject...</span>
                </button>
              </div>

              {showRematchSubjectPicker && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-slate-400">
                    Select Subject for Rematch Duel:
                  </label>
                  <select
                    value={rematchSubjectId}
                    onChange={(e) => setRematchSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    {availableSubjects.map((s) => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.code} — {s.subjectName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      const subj = availableSubjects.find(s => s.subjectId === rematchSubjectId) || selectedSubject;
                      sendInstantChallenge(opponentUid, opponentName, subj);
                    }}
                    className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-bold text-xs text-white transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  >
                    Send Rematch in Selected Subject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Question Review & Solutions button */}
          <div className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Battle Questions & Answer Key</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-semibold">
                {battleQuestions.length} Questions
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inspect your answers vs. correct AKTU solutions, concept explanations, and time taken per round.
            </p>
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 hover:border-cyan-400 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Review Battle Questions & Explanations</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setBattleState('lobby')}
              className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Back to Arena Lobby
            </button>
            <button
              onClick={battleMode === 'multiplayer' ? startMultiplayerMatchmaking : startSoloBattle}
              className="flex-1 py-3 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-cyan-400 hover:from-violet-300 hover:to-cyan-300 text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            >
              {battleMode === 'multiplayer' ? 'Search New Opponent' : 'Play Solo Again'}
            </button>
          </div>
        </GlassCard>

        {/* Question Review Modal */}
        <BattleReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          record={lastFinishedRecord}
        />
      </div>
    );
  }

  // 5. Active Battle Screen
  const currentQ = battleQuestions[currentIndex] || battleQuestions[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Live Battle Scoreboard Header */}
      <GlassCard className="p-4 sm:p-6" glow="violet">
        <div className="grid grid-cols-3 items-center">
          {/* Player 1 Status */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-tr from-cyan-400 to-violet-500 p-0.5 flex-shrink-0 hidden sm:block">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-full h-full rounded-lg object-cover" />
              ) : (
                <div className="w-full h-full rounded-lg bg-slate-900 flex items-center justify-center text-cyan-300 font-bold text-xs">
                  {profile?.displayName?.[0] || 'Y'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-cyan-400 truncate">
                {profile?.displayName || 'You'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {profile?.collegeName || profile?.university || 'AKTU'}
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-100 mt-0.5">
                {playerScore} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-1.5 rounded-full ${
                      i <= currentIndex ? 'bg-cyan-400' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Center Timer */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sm font-bold text-amber-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
              Question {currentIndex + 1} / 5
            </div>
          </div>

          {/* Opponent Status or Solo Target */}
          <div className="text-right">
            {battleMode === 'multiplayer' ? (
              <>
                <div className="text-xs font-bold text-violet-400 truncate">
                  {opponentName}
                </div>
                <div className="text-xl font-extrabold text-slate-100 mt-0.5">
                  {opponentScore} <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
                <div className="flex gap-1 justify-end mt-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-1.5 rounded-full ${
                        i < opponentCurrentQ ? 'bg-violet-400' : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-emerald-400 truncate">
                  Target Score
                </div>
                <div className="text-xl font-extrabold text-slate-100 mt-0.5">
                  400 <span className="text-xs font-normal text-slate-400">pts</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Solo Speed Sprint
                </div>
              </>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Active Question Box */}
      {currentQ && (
        <div className="p-5 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          <div className="text-xs text-cyan-400 font-semibold mb-2 uppercase tracking-wider">
            {selectedSubject.code} • Unit {currentQ.unit} ({currentQ.topic})
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-5 max-h-48 sm:max-h-60 overflow-y-auto">
            <h3 className="text-sm sm:text-base font-medium text-slate-100 whitespace-pre-wrap break-words leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          <div className="space-y-2.5 mb-5 max-h-72 overflow-y-auto pr-1">
            {currentQ.options?.map((opt, idx) => {
              const optionLetter = String.fromCharCode(65 + idx);
              const isSelected = selectedOption === opt;
              let optionStyle = 'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-slate-700 hover:bg-slate-900';
              let badgeStyle = 'bg-slate-800 text-slate-200 font-bold border-slate-700';

              if (isAnswerChecked) {
                if (opt === currentQ.correctAnswer) {
                  optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                  badgeStyle = 'bg-emerald-500 text-slate-950 font-bold border-emerald-400';
                } else if (isSelected) {
                  optionStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                  badgeStyle = 'bg-rose-500 text-white font-bold border-rose-400';
                }
              } else if (isSelected) {
                optionStyle = 'border-cyan-500 bg-cyan-950/30 text-cyan-200';
                badgeStyle = 'bg-cyan-500 text-slate-950 font-bold border-cyan-400';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerChecked}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${optionStyle}`}
                >
                  <span className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center shrink-0 border mt-0.5 ${badgeStyle}`}>
                    {optionLetter}
                  </span>
                  <span className="flex-1 min-w-0 break-words whitespace-normal leading-relaxed">
                    {opt}
                  </span>
                  {isAnswerChecked && opt === currentQ.correctAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => handleNextQuestion(true)}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-600 hover:bg-cyan-500 text-xs transition-colors cursor-pointer shadow-sm"
              >
                {currentIndex < 4 ? 'Next Question →' : 'View Battle Result'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
