export type ApplyPhase = "flush" | "apply" | "refresh";

/** Await persisted editor changes before APPLY, then reload from the authoritative response. */
export async function applyConfirmedProposal<T>(steps: {
    flush: () => Promise<unknown>;
    apply: () => Promise<T>;
    isCurrent: () => boolean;
    remember: (proposal: T) => void;
    reload: (proposal: T) => Promise<unknown>;
    phase: (phase: ApplyPhase) => void;
}): Promise<void> {
    await steps.flush();
    steps.phase("apply");
    const proposal = await steps.apply();
    if (!steps.isCurrent()) return;
    steps.remember(proposal);
    steps.phase("refresh");
    await steps.reload(proposal);
}
