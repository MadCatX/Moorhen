import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { MoorhenStack } from "@/components/interface-base";

export const ModifyNtC = () => {
    const shownControl = useSelector((state: RootState) => state.globalUI.shownControl);
    const molNo = shownControl?.name === "modifyNtC" ? (shownControl.payload?.molNo ?? 0) : 0;
    const chosenAtom = shownControl?.name === "modifyNtC" ? (shownControl.payload?.chosenAtom ?? null) : null;

    return (
        <MoorhenStack direction="vertical">
            <div>Modify NtC</div>

            <div>
                <div>Assigned NtC</div>
                <div></div>

                <div>Closest NtC</div>
                <div></div>

                <div>RMSD of displayed NtC</div>
                <div></div>

                <div>Alt. conf</div>
                <div>
                    <select>
                    </select>
                </div>

                <div>Displayed NtC</div>
                <div>
                    <select>
                    </select>

                    <button>Reset</button>
                </div>
            </div>

            <div>Torsions &amp; distances</div>


            <div>
                <div></div>
                <div>Actual (deg)</div>
                <div>{'\u03B4'} to NtC (deg)</div>

                <div>{'\u018D'}1</div>
                <div></div>
                <div></div>

                <div>{'\u025B'}1</div>
                <div></div>
                <div></div>

                <div>{'\u03B6'}1</div>
                <div></div>
                <div></div>

                <div>{'\u03B1'}2</div>
                <div></div>
                <div></div>

                <div>{'\u03B2'}2</div>
                <div></div>
                <div></div>

                <div>{'\u03B3'}2</div>
                <div></div>
                <div></div>

                <div>{'\u03B4'}2</div>
                <div></div>
                <div></div>

                <div>{'\u03C7'}1</div>
                <div></div>
                <div></div>

                <div>{'\u03C7'}2</div>
                <div></div>
                <div></div>

                <div>C'C'</div>
                <div></div>
                <div></div>

                <div>N'N'</div>
                <div></div>
                <div></div>

                <div>{'\u00B5'}</div>
                <div></div>
                <div></div>
            </div>
        </MoorhenStack>
    );
}
