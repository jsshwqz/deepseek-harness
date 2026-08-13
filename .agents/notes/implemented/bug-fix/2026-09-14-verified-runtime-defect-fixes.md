# Agent Note: Verified runtime defect fixes across bash, DeepSeek adapter, and token meter

Status: implemented

English

## Problem

Three independent runtime defects were found during a targeted audit of the shell, llm, and compaction package groups. Each is observable in production and was confirmed against source before fixing: none are speculative, and none were taken from unverified scan output. Several other plausible-looking candidates were inspected and deliberately left untouched because they are either protected by an invariant, intentional design, or would conflict with repository conventions.

## Decision

Apply three minimal, source-verified fixes, each in its own commit, plus a regression test for the token-meter case.

**Persistent bash reports timeout only.** `tool-bash-persistent`'s timeout message speculated `or experienced an OOM error`, but the deadline fence can only observe a timeout and cannot establish an OOM. The file's own inline TODO (`Report a timeout only; this signal does not establish an OOM.`) acknowledged exactly this gap. The message now reports the timeout only; the test that asserted the old text is updated.

**DeepSeek config schema agrees with the resolver.** `llm-deepseek`'s `streamIdleTimeoutMs` schema used `.min(Number.MIN_VALUE)` (~2.2e-308), which silently admits zero and every negative number — the opposite of the resolver's `> 0` check. A malformed default therefore passed schema validation yet failed loudly at the first static composition entry. Changed to `.min(1)` to mirror the resolver.

**Token meter surfaces a named error.** `token-meter`'s `_foldEvent` force-unwrapped `surface!.tokens` for `assistant/message`. A non-surface-bound event (e.g. a legacy replay where the writer dropped the `surfaceOp`) now throws a named diagnostic (`token meter: assistant/message at seq N is not surface-bound; cannot price it`) instead of an opaque `TypeError`. A regression test injects such an event via `appendUnchecked` and asserts the new message.

## Alternatives considered

**Silently swallow a non-surface-bound `assistant/message` in the meter.** Rejected: silent pricing on a contract-violating event would propagate incorrect token accounting; a named error matches the repo's convention for log-contract violations and matches the sibling `step/start` diagnostic.

**Drop a type assertion (`as RequestErrorAction`) for `llm-retry.backoff`.** Rejected: the function's `undefined` paths are handled correctly downstream by `?.kind`, and the repo explicitly bans `as` casts, so a cosmetic fix would violate convention without changing behavior.

**Fix the `pwsh-local` stdout/stderr offset bookkeeping.** Rejected: the claimed data loss rests on an assumption about the internal `readFrom` contract that was not verified against source, and the identical read pattern is mirrored by `bash-local` call-for-call, which would have surfaced under the repo's coverage gate if it genuinely dropped output.

**Reclassify the DeepSeek adapter's watchdog abort.** Rejected: line 308 states the outer stream classifies via the watchdog signal, and re-throwing the raw `AbortError` is intentional so the outer layer can distinguish caller cancellation from idle timeout.

**Replace the `tool/result` compaction replacement with a dedicated event type.** Rejected: using `surfaceOp: replace` to shadow an older event is the intended mechanism for pure-log consumers; changing it would be an architectural decision beyond the scope of a defect fix.

## Consequences

Timeout failures no longer mislead the model with an unsubstantiated OOM hypothesis; malformed `streamIdleTimeoutMs` values are now caught at schema time consistently with the resolver; and token-meter crashes on malformed replay logs become recoverable named diagnostics. Each change is localized, adds or updates exactly one test, and stays within repository conventions. No durable, wire, or configuration format is altered.
