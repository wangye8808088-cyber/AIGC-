export function getScoreComparison(originalScore: number, rewrittenScore: number) {
  const delta = originalScore - rewrittenScore

  return {
    delta,
    message:
      delta > 0
        ? `本次检测从 ${originalScore}% 降为 ${rewrittenScore}%，降低 ${delta} 个百分点。`
        : `本次检测从 ${originalScore}% 变为 ${rewrittenScore}%，未达到降低效果。`,
  }
}
