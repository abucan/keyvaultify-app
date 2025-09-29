// src/components/terminal/terminal-formatters.tsx
export function formatOutputLine(line: string, isDark: boolean) {
  if (line.startsWith('✅'))
    return (
      <span className={isDark ? 'text-green-400' : 'text-green-600'}>
        {line}
      </span>
    )
  if (line.startsWith('🔑') || line.startsWith('🔐') || line.startsWith('🔓'))
    return (
      <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>{line}</span>
    )
  if (line.startsWith('📦') || line.startsWith('☁️') || line.startsWith('📄'))
    return (
      <span className={isDark ? 'text-cyan-400' : 'text-cyan-600'}>{line}</span>
    )
  if (line.startsWith('🆔') || line.startsWith('🌱'))
    return (
      <span className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>
        {line}
      </span>
    )
  if (line.includes('KeyVaultify CLI'))
    return (
      <span
        className={`${isDark ? 'text-purple-400' : 'text-purple-600'} font-bold`}
      >
        {line}
      </span>
    )
  if (line.includes('Commands:'))
    return (
      <span
        className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-semibold`}
      >
        {line}
      </span>
    )
  if (
    line.includes('login') ||
    line.includes('init') ||
    line.includes('push') ||
    line.includes('pull')
  ) {
    return (
      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{line}</span>
    )
  }
  return (
    <span className={isDark ? 'text-gray-300' : 'text-gray-800'}>{line}</span>
  )
}

export const getTerminalTheme = (theme: 'dark' | 'light') => {
  const isDark = theme === 'dark'
  return {
    isDark,
    terminalBg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    headerBg: isDark ? 'bg-gray-800' : 'bg-gray-200',
    borderColor: isDark ? 'border-gray-700' : 'border-gray-300',
    textColor: isDark ? 'text-gray-300' : 'text-gray-700',
    promptColor: isDark ? 'text-green-400' : 'text-green-600',
    inputTextColor: isDark ? 'text-white' : 'text-gray-900',
    cursorBg: isDark ? 'bg-white' : 'bg-gray-900'
  }
}
