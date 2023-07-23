package main

import (
	"database/sql"

	"errors"

	"fmt"

	"log"

	"net/http"

	"strconv"

	"time"

	"github.com/gin-contrib/cors"

	"github.com/gin-gonic/gin"

	_ "github.com/go-sql-driver/mysql"
)

type SeatDetails struct {
	ID       int    `json:"id"`
	SeatNo   string `json:"seatno"`
	SeatType string `json:"seattype"`
	Price    int    `json:"price"`
	Status   bool   `json:"status"`
	Selected bool   `json:"selected"`
}

func getSeats(context *gin.Context) {
	db, err := sql.Open("mysql", "root:harsh.m123@tcp(localhost:3306)/harshdb1")
	if err != nil {
		log.Fatal(err)
		fmt.Println("Error in opening the database... Please check")
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer db.Close()

	rows, err := db.Query("SELECT * FROM seat")
	if err != nil {
		log.Fatal(err)
		fmt.Println("Error")
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var seats []SeatDetails
	for rows.Next() {
		var seat SeatDetails
		err := rows.Scan(&seat.ID, &seat.SeatNo, &seat.SeatType, &seat.Price, &seat.Status, &seat.Selected)
		if err != nil {
			log.Fatal(err)
			fmt.Println("Error in scanning rows")
			context.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		seats = append(seats, seat)
	}

	context.JSON(http.StatusOK, seats)
}

func getSeat(context *gin.Context) {
	id := context.Param("id")
	id2, err := strconv.Atoi(id)
	if err != nil {
		context.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Invalid ID"})
		return
	}

	seat, err := getSeatById(id2)
	if err != nil {
		context.IndentedJSON(http.StatusNotFound, gin.H{"message": "Seat Not Found"})
		return
	}

	context.IndentedJSON(http.StatusOK, seat)
}

func getSeatById(id int) (*SeatDetails, error) {
	db, err := sql.Open("mysql", "root:harsh.m123@tcp(localhost:3306)/harshdb1")
	if err != nil {
		log.Fatal(err)
		fmt.Println("Error in opening the database... Please check")
		return nil, err
	}
	defer db.Close()

	row := db.QueryRow("SELECT * FROM seat WHERE id = ?", id)

	var seat SeatDetails
	err = row.Scan(&seat.ID, &seat.SeatNo, &seat.SeatType, &seat.Price, &seat.Status, &seat.Selected)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("Seat Not Found, Please Try Again")
		}
		log.Fatal(err)
		fmt.Println("Error in scanning row")
		return nil, err
	}

	return &seat, nil
}

func updateStatus(context *gin.Context) {
	id := context.Param("id")
	id2, err := strconv.Atoi(id)
	if err != nil {
		context.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Invalid ID"})
		return
	}

	db, err := sql.Open("mysql", "root:harsh.m123@tcp(localhost:3306)/harshdb1")
	if err != nil {
		log.Fatal(err)
		fmt.Println("Error inopening the database... Please check")
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	defer db.Close()

	log.Println(id2)

	_, err = db.Exec("UPDATE seat SET Available = NOT Available, selected = NOT selected where ID = ?", id2)
	if err != nil {
		log.Fatal(err)
		fmt.Println("Error in updating seat status")
		context.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Seat status updated successfully"})
}

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:19006"} // Update with your client's origin
	config.AllowMethods = []string{"GET", "POST", "PATCH"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	config.ExposeHeaders = []string{"Content-Length"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))

	router.GET("/seats", getSeats)
	router.GET("/seats/:id", getSeat)
	router.PATCH("/seats/:id", updateStatus)

	router.Run("localhost:9909")
}