import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, setShownControl, triggerUpdate } from "@/store";
import { useCommandCentre, useMoorhenInstance } from "@/InstanceManager";
import { gemmi } from "../../../types/gemmi";
import { moorhen } from "../../../types/moorhen";
import { MoorhenMolecule } from "../../../utils/MoorhenMolecule";
import { type AtomDescription } from "../../../InstanceManager/CommandCentre/LlkaWorker";
import * as LT from "../../../types/llka";

const NtCs = [
    '(Closest)',
    'AA00',
    'AA02',
    'AA03',
    'AA04',
    'AA08',
    'AA09',
    'AA01',
    'AA05',
    'AA06',
    'AA10',
    'AA11',
    'AA07',
    'AA12',
    'AA13',
    'AB01',
    'AB02',
    'AB03',
    'AB04',
    'AB05',
    'BA01',
    'BA05',
    'BA09',
    'BA08',
    'BA10',
    'BA13',
    'BA16',
    'BA17',
    'BB00',
    'BB01',
    'BB17',
    'BB02',
    'BB03',
    'BB11',
    'BB16',
    'BB04',
    'BB05',
    'BB07',
    'BB08',
    'BB10',
    'BB12',
    'BB13',
    'BB14',
    'BB15',
    'BB20',
    'IC01',
    'IC02',
    'IC03',
    'IC04',
    'IC05',
    'IC06',
    'IC07',
    'OP01',
    'OP02',
    'OP03',
    'OP04',
    'OP05',
    'OP06',
    'OP07',
    'OP08',
    'OP09',
    'OP10',
    'OP11',
    'OP12',
    'OP13',
    'OP14',
    'OP15',
    'OP16',
    'OP17',
    'OP18',
    'OP19',
    'OP20',
    'OP21',
    'OP22',
    'OP23',
    'OP24',
    'OP25',
    'OP26',
    'OP27',
    'OP28',
    'OP29',
    'OP30',
    'OP31',
    'OPS1',
    'OP1S',
    'AAS1',
    'AB1S',
    'AB2S',
    'BB1S',
    'BB2S',
    'BBS1',
    'ZZ01',
    'ZZ02',
    'ZZ1S',
    'ZZ2S',
    'ZZS1',
    'ZZS2'
] as const;

function altlocToStr(codepoint: number) {
    if (codepoint === 0) return '';
    return String.fromCodePoint(codepoint);
}

/*
 * ===
 * This would probably be better done elsewhere and use the gemmi
 * representation as the data exchange format.
 *
 * ===
 */
function makeLlkaResidue(residue: { chain: gemmi.Chain, residue: gemmi.Residue }, filterAltloc: string) {
    const atoms: AtomDescription[] = [];

    for (let idx = 0; idx < residue.residue.atoms.size(); idx++) {
        const gemmiAtom = residue.residue.atoms.get(idx);
        const altloc = altlocToStr(gemmiAtom.altloc_or(0));
        if (altloc === '' || altloc === filterAltloc) {
            atoms.push({
                element_name: gemmiAtom.name,
                element_symbol: gemmiAtom.element.name(),
                label_atom_id: gemmiAtom.name,
                label_comp_id: residue.residue.name,
                label_asym_id: residue.chain.name,
                id: gemmiAtom.serial,
                x: gemmiAtom.pos.x,
                y: gemmiAtom.pos.y,
                z: gemmiAtom.pos.z,
                label_seq_id: residue.residue.seqid.num.value,
                auth_seq_id: residue.residue.seqid.num.value, // Placeholder
                auth_asym_id: residue.chain.name,
                altloc: altlocToStr(gemmiAtom.altloc_or(0)),
                inscode: '', // Wrong but ResidueSeqId does not seem to expose icode
            });
        }
    }

    return atoms;
}

function gatherAltLocs(residue: gemmi.Residue) {
    const altlocs = new Set();

    for (let idx = 0; idx < residue.atoms.size(); idx++) {
        const atom = residue.atoms.get(idx);

        if (atom.has_altloc()) {
            let alt = altlocToStr(atom.altloc);
            altlocs.add(alt);
        }
    }

    return Array.from(altlocs);
}

async function removeSuperposedNtC(molecule: MoorhenMolecule | null) {
    if (molecule) {
        for (const r of molecule.representations) {
            r.hide();
            molecule.removeRepresentation(r.uniqueId);
        }
        await molecule.delete(true);
    }
}

function rad2deg(r?: number) {
    if (!r) return null;
    return r * 180.0 / Math.PI;
}

export const NtC = () => {
    const dispatch = useDispatch();
    const shownControl = useSelector((state: RootState) => state.globalUI.shownControl);
    const targetMolNo = shownControl?.name === "NtC" ? shownControl.payload?.molNo : 0;

    const molecules = useSelector((state: moorhen.State) => state.molecules.moleculeList);

    const cc = useCommandCentre();
    const mhi = useMoorhenInstance();

    const [metrics, setMetrics] = useState<LT.LLKAStepMetrics| null>(null);
    const [metricsDiffs, setMetricsDiffs] = useState<LT.LLKAStepMetrics| null>(null);
    const [selectedAltlocs, setSelectedAltlocs] = useState("-^-");
    const [selectedNtC, setSelectedNtC] = useState(-1);
    const [assignedNtC, setAssignedNtC] = useState('');
    const [closestNtC, setClosestNtC] = useState('');
    const [rmsd, setRmsd] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const superposedNtC = useRef<MoorhenMolecule | null>(null);

    const altlocCombinations = useMemo(() => {
        const firstResidue =  shownControl?.name === "NtC" ? shownControl.payload?.firstResidue : void 0;
        const secondResidue = shownControl?.name === "NtC" ? shownControl.payload?.secondResidue : void 0;

        if (!firstResidue || !secondResidue) return ["-^-"];

        let altlocsFirst = gatherAltLocs(firstResidue.residue);
        let altlocsSecond = gatherAltLocs(secondResidue.residue);
        if (altlocsFirst.length === 0) altlocsFirst.push(null);
        if (altlocsSecond.length === 0) altlocsSecond.push(null);

        const combinations = [];
        for (const altFirst of altlocsFirst) {
            for (const altSecond of altlocsSecond) {
                const tag = `${altFirst ?? '-'}^${altSecond ?? '-'}`;
                const text = `${altFirst ?? '-'} | ${altSecond ?? '-'}`;

                combinations.push([tag, text]);
            }
        }

        return combinations;
    }, [shownControl]);

    useEffect(() => {
        setSelectedAltlocs(altlocCombinations[0][0]);
    }, [altlocCombinations]);

    const getResidues = useCallback(() => {
        const firstResidue =  shownControl?.name === "NtC" ? shownControl.payload?.firstResidue : void 0;
        const secondResidue = shownControl?.name === "NtC" ? shownControl.payload?.secondResidue : void 0;
        if (!firstResidue || !secondResidue) return void 0;

        const altlocCombination = altlocCombinations.find(([tag, _]) => tag === selectedAltlocs)![0]!;
        const [altlocA, altlocB] = altlocCombination.split('^', 2);

        const first = makeLlkaResidue(firstResidue, altlocA);
        const second = makeLlkaResidue(secondResidue, altlocB);

        return [first, second];
    }, [shownControl, selectedAltlocs]);

    const superposeNtC = async (NtCStructure: string) => {
        if (superposedNtC.current) {
            await removeSuperposedNtC(superposedNtC.current);
            superposedNtC.current = null;
        }

        superposedNtC.current = new MoorhenMolecule(cc, mhi.store, mhi.paths.monomerLibraryPath);
        superposedNtC.current.setBackgroundColour([128, 128, 64, 1]);
        superposedNtC.current.defaultBondOptions.smoothness = 1.0;
        superposedNtC.current.defaultColourRules = [];
        superposedNtC.current.addColourRule("molecule", "//*", "#FFFF00", ["//*", "#FFFF00"], false, true);

        superposedNtC.current.loadToCootFromString(NtCStructure, "LLKA_NtC.cif").then(() => {
            superposedNtC.current!.fetchIfDirtyAndDraw("CBs");
        });
    }

    const superposeAndClassify = async () => {
        const residues = getResidues();
        if (!residues) return;

        let response;
        if (selectedNtC === -1) {
            response = await cc.current.llkaCommand(
                {
                    uuid: '',
                    command: 'SuperposeClosestNtC',
                    firstResidue: residues[0],
                    secondResidue: residues[1],
                }
            );

            setAssignedNtC(response.assignedNtC);
            setClosestNtC(response.closestNtC);
        } else {
            response = await cc.current.llkaCommand(
                {
                    uuid: '',
                    command: 'SuperposeSpecificNtC',
                    firstResidue: residues[0],
                    secondResidue: residues[1],
                    NtC: selectedNtC,
                }
            );
        }

        setMetrics(response.metrics);
        setMetricsDiffs(response.diffs);
        setRmsd(response.rmsd);
        superposeNtC(response.superposedNtCStructure);
    };

    useEffect(() => {
        superposeAndClassify();
    }, [selectedAltlocs, selectedNtC, shownControl.payload]);

    useEffect(() => {
        return () => { removeSuperposedNtC(superposedNtC.current); }
    }, []);

    const torsions = (
        <div>
            <div>Torsions &amp; distances</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridColumnGap: '0.25rem' }}>
                <div></div>
                <div style={{ textAlign: 'right' }}>Actual (deg)</div>
                <div style={{ textAlign: 'right' }}>{'\u03B4'} to NtC (deg)</div>

                <div>{'\u018D'}1</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.delta_1)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.delta_1)?.toFixed(2) ?? ''} </div>

                <div>{'\u025B'}1</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.epsilon_1)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.epsilon_1)?.toFixed(2) ?? ''}</div>

                <div>{'\u03B6'}1</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.zeta_1)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.zeta_1)?.toFixed(2) ?? ''}</div>

                <div>{'\u03B1'}2</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.alpha_2)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.alpha_2)?.toFixed(2) ?? ''}</div>

                <div>{'\u03B2'}2</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.beta_2)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.beta_2)?.toFixed(2) ?? ''}</div>

                <div>{'\u03B3'}2</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.gamma_2)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.gamma_2)?.toFixed(2) ?? ''}</div>

                <div>{'\u03B4'}2</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.delta_2)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.delta_2)?.toFixed(2) ?? ''}</div>

                <div>{'\u03C7'}1</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.chi_1)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.chi_1)?.toFixed(2) ?? ''}</div>

                <div>{'\u03C7'}2</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.chi_2)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.chi_2)?.toFixed(2) ?? ''}</div>

                <div>C&apos;C&apos;</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.CC)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.CC)?.toFixed(2) ?? ''}</div>

                <div>N&apos;N&apos;</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.NN)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.NN)?.toFixed(2) ?? ''}</div>

                <div>{'\u00B5'}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metrics?.mu)?.toFixed(2) ?? ''}</div>
                <div style={{ fontFamily: 'monospace', textAlign: 'right' }}>{rad2deg(metricsDiffs?.mu)?.toFixed(2) ?? ''}</div>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gridColumnGap: '0.5rem' }}>
                <div>Assigned NtC</div>
                <div>{assignedNtC}</div>

                <div>Closest NtC</div>
                <div>{closestNtC}</div>

                <div>RMSD of displayed NtC</div>
                <div>{rmsd.toFixed(3)}</div>

                <div>Alt. conf</div>
                <div>
                    <select
                        value={selectedAltlocs}
                        onChange={(v) => setSelectedAltlocs(v.currentTarget.value)}
                    >
                        {altlocCombinations.map(([tag, text], idx) => <option value={tag} key={idx}>{text}</option>)}
                    </select>
                </div>

                <div>Displayed NtC</div>
                <div>
                    <select
                        value={selectedNtC}
                        onChange={(v) => {
                            const NtCIndex = parseInt(v.currentTarget.value);
                            setSelectedNtC(NtCIndex);

                            superposeAndClassify();
                        }}
                    >
                        {NtCs.map((ntc, idx) => <option key={idx} value={idx - 1}>{ntc}</option>)}
                    </select>

                    <button onClick={() => setSelectedNtC(-1)} >Reset</button>
                </div>
            </div>

            {isCollapsed ? null : torsions}

            <div>
                <button onClick={async () => {
                    if (!superposedNtC.current) return;
                    const molecule = molecules.find(molecule => molecule.molNo === targetMolNo);
                    if (!molecule) {
                        console.error('No molecule');
                        return;
                    }

                    const firstResidue =  shownControl?.name === "NtC" ? shownControl.payload?.firstResidue : void 0;
                    const secondResidue = shownControl?.name === "NtC" ? shownControl.payload?.secondResidue : void 0;

                    const cidFirst =  `//${firstResidue.chain.name}/${firstResidue.residue.seqid.num.value}/*`;
                    const cidSecond =  `//${secondResidue.chain.name}/${secondResidue.residue.seqid.num.value}/*`;

                    await cc.current.cootCommand(
                        {
                            returnType: "status",
                            command: "replace_fragment",
                            commandArgs: [targetMolNo, superposedNtC.current!.molNo, `${cidFirst}||${cidSecond}`],
                            changesMolecules: [targetMolNo],
                        },
                        false
                    );

                    molecule.setAtomsDirty(true);
                    await removeSuperposedNtC(null);
                    await molecule.redraw();

                    dispatch(triggerUpdate(targetMolNo));

                    dispatch(setShownControl(null));
                }}>
                    OK
                </button>

                <button onClick={() => dispatch(setShownControl(null))}>
                    Cancel
                </button>

                <button onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? 'Expand' : 'Collapse'}
                </button>
            </div>
        </div>
    );
}
