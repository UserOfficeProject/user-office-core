import { Icons } from '@material-table/core';
import AddBox from '@mui/icons-material/AddBox';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import Check from '@mui/icons-material/Check';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Clear from '@mui/icons-material/Clear';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import FilterList from '@mui/icons-material/FilterList';
import FirstPage from '@mui/icons-material/FirstPage';
import LastPage from '@mui/icons-material/LastPage';
import Remove from '@mui/icons-material/Remove';
import SaveAlt from '@mui/icons-material/SaveAlt';
import Search from '@mui/icons-material/Search';
import ViewColumn from '@mui/icons-material/ViewColumn';

export const tableIcons: Icons<never> = {
  Add: (props) => <AddBox {...props} />,
  Check: (props) => <Check {...props} />,
  Clear: (props) => <Clear {...props} />,
  Delete: (props) => <DeleteOutline {...props} />,
  DetailPanel: (props) => <ChevronRight {...props} />,
  Edit: (props) => <Edit {...props} />,
  Export: (props) => <SaveAlt {...props} />,
  Filter: (props) => <FilterList {...props} />,
  FirstPage: (props) => <FirstPage {...props} />,
  LastPage: (props) => <LastPage {...props} />,
  NextPage: (props) => <ChevronRight {...props} />,
  PreviousPage: (props) => <ChevronLeft {...props} />,
  ResetSearch: (props) => <Clear {...props} />,
  Search: (props) => <Search {...props} />,
  SortArrow: (props) => <ArrowUpward {...props} />,
  ThirdStateCheck: (props) => <Remove {...props} />,
  ViewColumn: (props) => <ViewColumn {...props} />,
};
