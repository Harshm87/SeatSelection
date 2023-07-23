import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

const BookSeat = () => {
  const [row1, setRow1] = useState([]);
  const [isselect,setisselect]=useState(false);
   const toggle =()=>{
    setisselect(!isselect)
   }

  useEffect(() => {
    connectToBackend();
  }, []);

  const connectToBackend = async () => {
    try {
      const response = await fetch("http://localhost:9909/seats");
      if (response.ok) {
        const data = await response.json();
        setRow1(data);
      } else {
        console.log("Error: " + response.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectrow1 = (index) => {
    let temprow = [];
    temprow = row1;
    temprow.map((item, ind) => {
      if (index == ind) {
        if (item.selected == true && item.status==true) {
          item.selected = false;
          item.status = true;
        } 
        else if(item.selected == false && item.status==true){
          item.selected = true;
          item.status = true;
        }
        else{item.status = true;}
      }
    });
    let tempseats = [];
    temprow.map((item) => {
      tempseats.push(item);
    });
    setRow1(tempseats);
  };


  const payClicked = async () => {
    const selectedSeats = row1.filter((seat) => seat.selected);

    try {
      await Promise.all(
        selectedSeats.map(async (seat) => {
          const response = await fetch(
            `http://localhost:9909/seats/${seat.id}`,
            {
              method: "PATCH",
            }
          );
          if (!response.ok) {
            console.log("Error: " + response.status);
          }
        })
      );

      console.log("Seat status updated successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const getSelectedSeatsCount = () => {
    
    let selectedSeats = [];
    row1.map((item) => {
      if (item.status==true && item.selected == true) {
        selectedSeats.push(1);
      }
    });
    return selectedSeats.length;
  }
  const Header = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity style={{marginTop:40}}>
          <Image
            source={require("../SeatSelection/assets/back.png")}
            style={styles.backbtn}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "column",marginTop:40 }}>
          <Text style={styles.headertextmovie}>Harry Potter</Text>
          <Text style={styles.headertextvenue}>PVR ICON</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <Header />

    <View style={styles.body}>
      <View style={styles.container}>
        <View style={styles.innercon}>
          <View>
            <FlatList
              data={row1}
              numColumns={6}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.allseats}
                  onPress={() => {
                    if( item.status == false && item.selected == true)
                    {
                       Alert.alert("Already booked");
                      console.log("Already booked");
                    }
                    else 
                    {
                      onSelectrow1(index);
                    }                      
                    }
                }
                  
                >
                  {item.status == true && item.selected == true ? (
                    <Image
                      source={require("./assets/seat1.png")}
                      style={styles.greenseat}
                    />
                  ) : item.status == true && item.selected == false  ? (
                    <Image
                      source={require("./assets/seat.png")}
                      style={styles.greenseat}
                    />
                   ):  item.status == false && item.selected == true ? (
                    <Image
                      source={require("./assets/seat1.png")}
                      style={styles.booked}
                    />
                  ):null}
                </TouchableOpacity>
                
              )}
            />
             <View style={{ bottom: 0, marginTop:220,flexDirection:"column",alignItems:"center" }}>
                <Image source={require("../SeatSelection/assets/Screen1.png")} style={{height:10,width:120,}}/>
                <Text style={{fontSize:12,marginTop:3}}>All Eyes Here</Text>
              </View>
          </View>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.selecteds}>
          {"Selected Seats " + getSelectedSeatsCount() + ""}
        </Text>
        <TouchableOpacity style={styles.book} onPress={payClicked}>
          <Text style={{ fontWeight: "bold" }}>
            {"Pay ₹" + getSelectedSeatsCount() * 299 + ""}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    // backgroundColor:"black",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  container: {
    width: "70%",
    height: "70%",
    borderWidth: 1,
    borderColor: "black",
  },
  greenseat: {
    width: 27,
    height: 27,
    tintColor: "green",
  },
  // avail: {
  //   width: 27,
  //   height: 27,
  // },
  booked: {
    width: 27,
    height: 27,
    tintColor: "#8e8e8e",
  },
  innercon: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    textAlign: "center",
    marginTop:50
  },
  allseats: {
    margin: 7,
  },
  info: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    height: "10%",
    width: "100%",
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selecteds: {
    color: "#000",
    marginLeft: 20,
    fontWeight: "bold",
  },
  book: {
    width: "20%",
    height: 35,
    backgroundColor: "#3AB2F7",
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  seatcolor: {
    height: 50,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  seatinfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subseat: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  header: {
    backgroundColor: "#3AB2F7",
    height: "12%",
    flexDirection: "row",
    // marginTop:37,
  },
  headertextmovie: {
    marginTop: 1,
    // marginBottom: 0,
    fontWeight: "bold",
    fontSize: 15,
  },
  backbtn: {
    height: 15,
    width: 20,
    margin: 12,
  },
  headertextvenue: {
    fontSize: 11,
    marginTop: 0,
    margin: 1,
    color: "#5F5F5F",
  },
});

export default BookSeat;