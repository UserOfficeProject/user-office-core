// import { useEffect, useState } from 'react';

// import { Facility } from 'generated/sdk';
// import { useDataApi } from 'hooks/common/useDataApi';

// export function useFacilityData(FacilityId: number | undefined) {
//   const [Facility, setFacility] = useState<Facility | null>(null);
//   const [loading, setLoading] = useState(true);

//   const api = useDataApi();

//   useEffect(() => {
//     let unmounted = false;
//     if (FacilityId) {
//       api()
//         .getFacility({ FacilityId })
//         .then((data) => {
//           if (unmounted) {
//             return;
//           }

//           if (data.Facility) {
//             setFacility(data.Facility as Facility);
//           }
//           setLoading(false);
//         });

//       return () => {
//         unmounted = true;
//       };
//     }
//   }, [api, FacilityId]);

//   return { loading, Facility, setFacility };
// }
