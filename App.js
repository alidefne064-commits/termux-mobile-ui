import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  background: '#000000',
  text: '#e7e7e7',
  muted: '#a8a8a8',
  green: '#00d26a',
  error: '#ff7777',
};

const INITIAL_LINES = [
  { text: 'Welcome to Termux', kind: 'heading' },
  { text: '' },
  { text: 'Docs:       https://doc.termux.com', kind: 'link' },
  { text: 'Community:  https://community.termux.com', kind: 'link' },
  { text: '' },
  { text: 'Working with packages:' },
  { text: ' - Search:   pkg search <query>' },
  { text: ' - Install:  pkg install <package>' },
  { text: ' - Upgrade:  pkg upgrade' },
  { text: '' },
  { text: 'Report issues at https://bugs.termux.com', kind: 'link' },
];

function runDemoCommand(rawCommand) {
  const command = rawCommand.trim();
  const [name, ...args] = command.split(/\s+/);
  const rest = args.join(' ');

  if (name === 'help') {
    return { lines: [
      'Available demo commands:',
      '  help                 Show this help',
      '  clear                Clear the screen',
      '  date                 Show the current date and time',
      '  pwd                  Show the demo working directory',
      '  ls                   List demo files',
      '  whoami               Show the demo user',
      '  echo <text>          Print text',
      '  pkg search <query>   Search sample packages',
      '  pkg install <name>   Simulate a package install',
      '  pkg upgrade          Simulate a package upgrade',
      '',
      'This is a safe demo shell; it does not run device commands.',
    ] };
  }
  if (name === 'clear') return { clear: true };
  if (name === 'date') return { lines: [new Date().toString()] };
  if (name === 'pwd') return { lines: ['/data/data/com.alidefne064.terminalpocket/files/home'] };
  if (name === 'ls') return { lines: ['README.md  notes.txt  projects/'] };
  if (name === 'whoami') return { lines: ['demo-user'] };
  if (name === 'echo') return { lines: [rest] };
  if (name === 'pkg' && args[0] === 'search') {
    const query = args.slice(1).join(' ').toLowerCase();
    if (!query) return { lines: ['Usage: pkg search <query>'], error: true };
    const samples = ['python', 'git', 'nodejs', 'nano', 'curl', 'vim'];
    const found = samples.filter((pkg) => pkg.includes(query));
    return { lines: found.length ? found.map((pkg) => `${pkg} - Sample package (demo only)`) : [`No sample packages found for: ${query}`] };
  }
  if (name === 'pkg' && args[0] === 'install') {
    const pkg = args.slice(1).join(' ');
    return pkg
      ? { lines: [`Checking ${pkg}...`, 'Demo mode: no package was downloaded or installed.'] }
      : { lines: ['Usage: pkg install <package>'], error: true };
  }
  if (name === 'pkg' && args[0] === 'upgrade') {
    return { lines: ['Checking for updates...', 'Demo mode: no system packages were changed.'] };
  }
  if (name === 'pkg') return { lines: ['Usage: pkg search <query> | pkg install <package> | pkg upgrade'], error: true };
  return { lines: [`${name}: command not available in safe demo mode. Type help to see available commands.`], error: true };
}

export default function App() {
  const [lines, setLines] = useState(INITIAL_LINES);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => scrollRef.current?.scrollToEnd({ animated: true }));
    const hide = Keyboard.addListener(hideEvent, () => scrollRef.current?.scrollToEnd({ animated: true }));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const submitCommand = () => {
    const raw = command.trim();
    if (!raw) return;
    const result = runDemoCommand(raw);
    if (result.clear) {
      setLines([]);
    } else {
      setLines((current) => [
        ...current,
        { text: `~ $ ${raw}`, kind: 'command' },
        ...result.lines.map((text) => ({ text, kind: result.error ? 'error' : 'output' })),
        { text: '' },
      ]);
    }
    setHistory((current) => [raw, ...current]);
    setHistoryIndex(-1);
    setCommand('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const recallHistory = (direction) => {
    if (!history.length) return;
    const next = Math.max(-1, Math.min(history.length - 1, historyIndex + direction));
    setHistoryIndex(next);
    setCommand(next === -1 ? '' : history[next]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="always"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {lines.map((line, index) => (
            <Text
              key={`${index}-${line.text}`}
              selectable
              style={[
                styles.line,
                line.kind === 'heading' && styles.heading,
                line.kind === 'link' && styles.link,
                line.kind === 'command' && styles.command,
                line.kind === 'error' && styles.error,
              ]}
            >
              {line.text || ' '}
            </Text>
          ))}
          <View style={styles.promptRow}>
            <Text style={styles.prompt}>~ $ </Text>
            <TextInput
              ref={inputRef}
              value={command}
              onChangeText={setCommand}
              onSubmitEditing={submitCommand}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'ArrowUp') recallHistory(1);
                if (nativeEvent.key === 'ArrowDown') recallHistory(-1);
              }}
              style={styles.input}
              placeholder=""
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              returnKeyType="send"
              blurOnSubmit={false}
              selectionColor={COLORS.text}
              accessibilityLabel="Enter a demo terminal command"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>SAFE DEMO · Commands are simulated</Text>
        <Text onPress={() => inputRef.current?.focus()} style={styles.keyboardAction} accessibilityRole="button">
          ⌨
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  keyboardArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingTop: 16, paddingBottom: 8 },
  line: { color: COLORS.text, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 17, lineHeight: 24, includeFontPadding: false },
  heading: { fontSize: 20, marginBottom: 22 },
  link: { color: '#dddddd' },
  command: { color: COLORS.text },
  error: { color: COLORS.error },
  promptRow: { minHeight: 30, flexDirection: 'row', alignItems: 'center' },
  prompt: { color: COLORS.green, fontFamily: 'monospace', fontSize: 18, lineHeight: 26 },
  input: { flex: 1, minHeight: 30, padding: 0, color: COLORS.text, fontFamily: 'monospace', fontSize: 18, lineHeight: 26 },
  bottomHint: { minHeight: 30, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#222' },
  hintText: { color: '#777', fontSize: 10, letterSpacing: 1 },
  keyboardAction: { color: '#999', fontSize: 18, paddingHorizontal: 8 },
});
