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
            <div>{molNo}</div>
            <div>{chosenAtom.chain_id} {chosenAtom.res_name}</div>
        </MoorhenStack>
    );
}
